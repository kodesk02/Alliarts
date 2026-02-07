"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import CameraController from "./Camera";
import Art from "./Art";
import Door from "./Door";

type WallArtItem = {
  id: number;
  image: string;
  z: number;
  wall: "left" | "right";
};

export default function Scene() {
  const [wallArt, setWallArt] = useState<WallArtItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch gallery images on mount
  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const handleClearGallery = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all artwork? This cannot be undone!",
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/gallery/clear", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Gallery cleared! 🗑️");
        // Reload gallery
        fetchGalleryImages();
      } else {
        alert("Failed to clear gallery: " + data.error);
      }
    } catch (error) {
      console.error("Clear error:", error);
      alert("Failed to clear gallery");
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

  // Calculate dynamic hallway length based on number of images
  const calculateHallwayLength = () => {
    if (wallArt.length === 0) return 40; // Default minimum length

    // Get the furthest artwork position (most negative z value)
    const furthestZ = Math.min(...wallArt.map((art) => art.z));

    // Add LOTS of extra space beyond the last artwork
    const requiredLength = Math.abs(furthestZ) + 30;

    // Minimum 40 units, grows as needed
    return Math.max(40, requiredLength);
  };

  const hallwayLength = calculateHallwayLength();
  
  // FIXED: Back wall positioned AFTER the furthest artwork
  const backWallZ = wallArt.length === 0 
    ? -20 
    : Math.min(...wallArt.map((art) => art.z)) - 10; // 10 units behind last art
  
  const doorZ = backWallZ + 0.5; // Door slightly in front of back wall

  return (
    <div className="relative w-full h-screen">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 text-white">
          <div className="text-2xl">Loading Gallery...</div>
        </div>
      )}

      <Canvas
        camera={{
          position: [0, 1, 5],
          fov: 60,
        }}
      >
        {/* Lights */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 13, 3]} color={"blue"} intensity={3} />

        {/* camera control - UPDATED to allow going further back */}
        <CameraController maxZ={backWallZ - 5} />

        {/* floor, ground plane - DYNAMIC LENGTH */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, -hallwayLength / 2 + 20]}
        >
          <planeGeometry args={[10, hallwayLength]} />
          <meshStandardMaterial color="#e7d9d9" />
        </mesh>

        {/* left wall - DYNAMIC LENGTH */}
        <mesh
          rotation={[0, Math.PI / 2, 0]}
          position={[-5, 4, -hallwayLength / 2 + 20]}
        >
          <planeGeometry args={[hallwayLength, 8]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>

        {/* wall art - USE art.z DIRECTLY FROM DATA */}
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

        {/* right wall - DYNAMIC LENGTH */}
        <mesh
          rotation={[0, -Math.PI / 2, 0]}
          position={[5, 4, -hallwayLength / 2 + 20]}
        >
          <planeGeometry args={[hallwayLength, 8]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>

        {/* Back wall with Door - POSITIONED AFTER LAST ARTWORK */}
        <mesh position={[0, 4, backWallZ]}>
          <planeGeometry args={[10, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Interactive Door - DYNAMIC POSITION */}
        <Door position={[0, 1.5, doorZ]} />
      </Canvas>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white p-4 rounded-lg backdrop-blur-sm">
        <p className="text-sm">🖱️ Mouse: Look around</p>
        <p className="text-sm">⬆️⬇️ Arrow Keys: Move forward/backward</p>
        <p className="text-sm">⬅️➡️ Arrow Keys: Turn left/right</p>
        <p className="text-sm">🚪 Click door to upload images</p>
        <p className="text-sm font-semibold mt-2">
          Gallery: {wallArt.length} artwork{wallArt.length !== 1 ? "s" : ""}
        </p>

        <button
          onClick={handleClearGallery}
          className="mt-3 w-full bg-red-500/80 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-semibold transition"
        >
          🗑️ Clear Gallery
        </button>
      </div>
    </div>
  );
}