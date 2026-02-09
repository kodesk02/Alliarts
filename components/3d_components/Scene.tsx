"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import CameraController from "./Camera";
import Art from "./Art";
import Door from "./Door";
import Decoration from "./Decoration";
import Chandelier from "./Chandelier";

type WallArtItem = {
  id: number;
  image: string;
  z: number;
  wall: "left" | "right";
};

export default function Scene() {
  const [wallArt, setWallArt] = useState<WallArtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const handleClearGallery = async () => {
    console.log("BUTTON CLICKED!");
    
    if (
      !confirm(
        "Are you sure you want to delete all artwork? This cannot be undone!",
      )
    ) {
      return;
    }

    setClearing(true);

    try {
      const response = await fetch("/api/gallery/clear", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setWallArt([]);
        alert("Gallery cleared! 🗑️");
        
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        alert("Failed to clear gallery: " + (data.error || "Unknown error"));
        setClearing(false);
      }
    } catch (error) {
      console.error("Clear error:", error);
      alert("Failed to clear gallery");
      setClearing(false);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch("/api/gallery");
      const data = await response.json();

      if (data.success) {
        setWallArt(data.images);
      }
    } catch (error) {
      console.error("Failed to fetch gallery images:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHallwayLength = () => {
    if (wallArt.length === 0) return 40;

    const furthestZ = Math.min(...wallArt.map((art) => art.z));
    const requiredLength = Math.abs(furthestZ) + 30;

    return Math.max(40, requiredLength);
  };

  const hallwayLength = calculateHallwayLength();
  
  const backWallZ = wallArt.length === 0 
    ? -20 
    : Math.min(...wallArt.map((art) => art.z)) - 10;
  
  const doorZ = backWallZ + 0.5;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {(loading || clearing) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 text-white">
          <div className="text-2xl">
            {clearing ? "Clearing Gallery..." : "Loading Gallery..."}
          </div>
        </div>
      )}

      <Canvas
        camera={{
          position: [0, 1, 5],
          fov: 60,
        }}
        shadows
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        {/* Professional Museum Lighting */}
        <ambientLight intensity={1.6} color="#f5f5f5" />
        
        {/* Main overhead lighting */}
        <directionalLight 
          position={[0, 10, 0]} 
          intensity={0.2} 
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Accent lighting from sides */}
        <directionalLight 
          position={[10, 5, 0]} 
          intensity={0.3} 
          color="#e8dcc4"
        />
        <directionalLight 
          position={[-10, 5, 0]} 
          intensity={0.3} 
          color="#e8dcc4"
        />

        <CameraController maxZ={backWallZ - 5} />

        {/* Chandeliers - Spaced elegantly */}
        {Array.from({ length: Math.ceil(hallwayLength / 12) }).map((_, i) => (
          <Chandelier key={i} position={[0, 7, -i * 12 + 2]} />
        ))}

        {/* Floor - Light gray polished */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, -hallwayLength / 2 + 20]}
          receiveShadow
        >
          <planeGeometry args={[10, hallwayLength]} />
          <meshStandardMaterial 
            color="#c8c8c8"
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>

        {/* Floor border detail - left */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-4.5, 0.01, -hallwayLength / 2 + 20]}
          receiveShadow
        >
          <planeGeometry args={[0.3, hallwayLength]} />
          <meshStandardMaterial 
            color="#a0a0a0"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* Floor border detail - right */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[4.5, 0.01, -hallwayLength / 2 + 20]}
          receiveShadow
        >
          <planeGeometry args={[0.3, hallwayLength]} />
          <meshStandardMaterial 
            color="#a0a0a0"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* Left wall - Blackish with texture */}
        <mesh
          rotation={[0, Math.PI / 2, 0]}
          position={[-5, 4, -hallwayLength / 2 + 20]}
          receiveShadow
        >
          <planeGeometry args={[hallwayLength, 8]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Left wall decorative panels */}
        {Array.from({ length: Math.ceil(hallwayLength / 8) }).map((_, i) => (
          <mesh
            key={`left-panel-${i}`}
            rotation={[0, Math.PI / 2, 0]}
            position={[-4.98, 4, -i * 8 + 2]}
          >
            <planeGeometry args={[6, 6]} />
            <meshStandardMaterial 
              color="#242424"
              roughness={0.7}
              metalness={0.2}
            />
          </mesh>
        ))}

        {/* Left wall top trim - gold accent */}
        <mesh
          rotation={[0, Math.PI / 2, 0]}
          position={[-4.95, 7.8, -hallwayLength / 2 + 20]}
        >
          <boxGeometry args={[hallwayLength, 0.15, 0.08]} />
          <meshStandardMaterial 
            color="#c9a961" 
            metalness={0.9} 
            roughness={0.1}
          />
        </mesh>

        {/* Left wall bottom trim - gold accent */}
        <mesh
          rotation={[0, Math.PI / 2, 0]}
          position={[-4.95, 0.2, -hallwayLength / 2 + 20]}
        >
          <boxGeometry args={[hallwayLength, 0.15, 0.08]} />
          <meshStandardMaterial 
            color="#c9a961" 
            metalness={0.9} 
            roughness={0.1}
          />
        </mesh>

        {/* Wall art */}
        {wallArt.map((art) => {
          const isLeft = art.wall === "left";

          return (
            <Art
              key={art.id}
              position={[isLeft ? -4.94 : 4.94, 2.8, art.z]}
              rotation={isLeft ? [0, Math.PI / 2, 0] : [0, -Math.PI / 2, 0]}
              image={art.image}
            />
          );
        })}

        {/* Right wall - Blackish with texture */}
        <mesh
          rotation={[0, -Math.PI / 2, 0]}
          position={[5, 4, -hallwayLength / 2 + 20]}
          receiveShadow
        >
          <planeGeometry args={[hallwayLength, 8]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Right wall decorative panels */}
        {Array.from({ length: Math.ceil(hallwayLength / 8) }).map((_, i) => (
          <mesh
            key={`right-panel-${i}`}
            rotation={[0, -Math.PI / 2, 0]}
            position={[4.98, 4, -i * 8 + 2]}
          >
            <planeGeometry args={[6, 6]} />
            <meshStandardMaterial 
              color="#242424"
              roughness={0.7}
              metalness={0.2}
            />
          </mesh>
        ))}

        {/* Right wall top trim - gold accent */}
        <mesh
          rotation={[0, -Math.PI / 2, 0]}
          position={[4.95, 7.8, -hallwayLength / 2 + 20]}
        >
          <boxGeometry args={[hallwayLength, 0.15, 0.08]} />
          <meshStandardMaterial 
            color="#c9a961" 
            metalness={0.9} 
            roughness={0.1}
          />
        </mesh>

        {/* Right wall bottom trim - gold accent */}
        <mesh
          rotation={[0, -Math.PI / 2, 0]}
          position={[4.95, 0.2, -hallwayLength / 2 + 20]}
        >
          <boxGeometry args={[hallwayLength, 0.15, 0.08]} />
          <meshStandardMaterial 
            color="#c9a961" 
            metalness={0.9} 
            roughness={0.1}
          />
        </mesh>

        {/* Decorative pedestals */}
        {Array.from({ length: Math.floor(hallwayLength / 15) }).map((_, i) => (
          <Decoration 
            key={`left-${i}`} 
            position={[-3.5, 0, -i * 15 - 7]} 
            type="pedestal"
          />
        ))}
        
        {Array.from({ length: Math.floor(hallwayLength / 15) }).map((_, i) => (
          <Decoration 
            key={`right-${i}`} 
            position={[3.5, 0, -i * 15 - 10]} 
            type="pedestal"
          />
        ))}

        {/* Ceiling - Light gray */}
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 8, -hallwayLength / 2 + 20]}
        >
          <planeGeometry args={[10, hallwayLength]} />
          <meshStandardMaterial 
            color="#d0d0d0"
            roughness={0.9}
          />
        </mesh>

        {/* Ceiling recessed lighting panels */}
        {Array.from({ length: Math.ceil(hallwayLength / 6) }).map((_, i) => (
          <mesh
            key={`ceiling-light-${i}`}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 7.98, -i * 6 + 2]}
          >
            <planeGeometry args={[2, 2]} />
            <meshStandardMaterial 
              color="#ffffff"
              emissive="#fff8e7"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

        {/* Ceiling trim */}
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 8, -hallwayLength / 2 + 20]}
        >
          <boxGeometry args={[10.2, hallwayLength, 0.05]} />
          <meshStandardMaterial 
            color="#b8b8b8"
            roughness={0.5}
          />
        </mesh>

        {/* Back wall - Blackish */}
        <mesh position={[0, 4, backWallZ]} receiveShadow>
          <planeGeometry args={[10, 8]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.8}
          />
        </mesh>

        {/* Back wall decorative panel */}
        <mesh position={[0, 4, backWallZ + 0.01]}>
          <planeGeometry args={[8, 6]} />
          <meshStandardMaterial 
            color="#242424"
            roughness={0.7}
          />
        </mesh>

        {/* Door */}
        <Door position={[0, 1.5, doorZ]} />
      </Canvas>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white p-4 rounded-lg backdrop-blur-sm z-[100] pointer-events-auto">
        <p className="text-sm">🖱️ Mouse: Look around</p>
        <p className="text-sm">⬆️⬇️ Arrow Keys: Move forward/backward</p>
        <p className="text-sm">⬅️➡️ Arrow Keys: Turn left/right</p>
        <p className="text-sm">🚪 Click door to upload images</p>
        <p className="text-sm font-semibold mt-2">
          Gallery: {wallArt.length} artwork{wallArt.length !== 1 ? "s" : ""}
        </p>

        <button
          onClick={handleClearGallery}
          disabled={clearing || loading}
          className="mt-3 w-full bg-red-500/80 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {clearing ? "Clearing..." : "🗑️ Clear Gallery"}
        </button>
      </div>
    </div>
  );
}