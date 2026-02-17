"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useMemo, useRef } from "react";
import CameraController from "./Camera";
import Art from "./Art";
import Door from "./Door";
import Chandelier from "./Chandelier";

type WallArtItem = {
  id: number;
  image: string;
  z: number;
  wall: "left" | "right";
};

const HALL_START_Z = 2;
const HALL_W       = 18;
const WALL_H       = 9;
const ART_Y        = 3.2;
const ART_SPACING  = 7;
const SLOT_START_Z = HALL_START_Z - 4;
const WALL_MARGIN  = 5;
const MIN_HALL_END = -40;

function computeSlots(hallEndZ: number) {
  const zPositions: number[] = [];
  for (let z = SLOT_START_Z; z > hallEndZ + WALL_MARGIN; z -= ART_SPACING) {
    zPositions.push(z);
  }
  const slots: { position: [number, number, number]; rotation: [number, number, number] }[] = [];
  for (const z of zPositions) {
    slots.push({ position: [-(HALL_W / 2 - 0.08), ART_Y, z], rotation: [0,  Math.PI / 2, 0] });
    slots.push({ position: [  HALL_W / 2 - 0.08,  ART_Y, z], rotation: [0, -Math.PI / 2, 0] });
  }
  return slots;
}

function requiredHallEnd(artCount: number): number {
  let endZ = MIN_HALL_END;
  while (computeSlots(endZ).length <= artCount) endZ -= ART_SPACING;
  return endZ;
}

// Detect mobile once on load
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

export default function Scene() {
  const [wallArt, setWallArt]   = useState<WallArtItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [clearing, setClearing] = useState(false);

  // Mobile joystick state — refs so no re-renders in the move loop
  const moveRef = useRef(0); // -1 back, +1 forward

  useEffect(() => { fetchGalleryImages(); }, []);

  const handleClearGallery = async () => {
    if (!confirm("Are you sure you want to delete all artwork? This cannot be undone!")) return;
    setClearing(true);
    try {
      const res  = await fetch("/api/gallery/clear", { method: "DELETE", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.success) {
        setWallArt([]);
        alert("Gallery cleared!");
        setTimeout(() => window.location.reload(), 100);
      } else {
        alert("Failed to clear gallery: " + (data.error || "Unknown error"));
        setClearing(false);
      }
    } catch {
      alert("Failed to clear gallery");
      setClearing(false);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const res  = await fetch("/api/gallery");
      const data = await res.json();
      if (data.success) setWallArt(data.images);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { hallEndZ, slots, assignedArt, hallMidZ, hallLen } = useMemo(() => {
    const hallEndZ    = requiredHallEnd(wallArt.length);
    const slots       = computeSlots(hallEndZ);
    const assignedArt = wallArt.map((art, i) => ({ ...art, slot: slots[i] }));
    const hallMidZ    = (HALL_START_Z + hallEndZ) / 2;
    const hallLen     = HALL_START_Z - hallEndZ;
    return { hallEndZ, slots, assignedArt, hallMidZ, hallLen };
  }, [wallArt.length]);

  const doorZ    = hallEndZ + 0.3;
  const camMinZ  = hallEndZ + 3;
  const numLights = Math.ceil(hallLen / 10);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#e8e8e8" }}>
      {(loading || clearing) && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", background: "rgba(255,255,255,0.92)", zIndex: 50, color: "#111" }}>
          <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: "0.2em" }}>
            {clearing ? "CLEARING GALLERY..." : "LOADING GALLERY..."}
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 1.8, 6], fov: 70 }}
        // shadows intentionally OFF — shadow maps are expensive and cause mobile crashes
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          // CRITICAL for mobile: prevents crash on low-end GPUs that fail WebGL perf check
          failIfMajorPerformanceCaveat: false,
        }}
        // Cap DPR: mobile devices often have dpr=3, allocating 9x pixels = GPU memory crash
        // We detect mobile and hard-cap at 1; desktop gets up to 1.5
        dpr={isMobile ? 1 : [1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={3.5} color="#ffffff" />
        {/* No castShadow on any light — shadow maps are expensive */}
        <directionalLight position={[0, 12, hallMidZ]}    intensity={0.5} color="#ffffff" />
        <directionalLight position={[ 9, 6, hallMidZ]}    intensity={0.2} color="#f0f0ff" />
        <directionalLight position={[-9, 6, hallMidZ]}    intensity={0.2} color="#f0f0ff" />
        <pointLight       position={[0, 4, hallEndZ + 8]} intensity={2.5} distance={18} color="#ffffff" />
        <fog attach="fog" args={["#e8e8e8", 45, Math.abs(hallEndZ) + 35]} />

        <CameraController minZ={camMinZ} maxZ={6} />

        {/* ── ELEVATOR LOBBY ── */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 8]}>
          <planeGeometry args={[18, 6]} />
          <meshStandardMaterial color="#c8c8c8" roughness={0.2} metalness={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_H, 8]}>
          <planeGeometry args={[18, 6]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} position={[-9, WALL_H / 2, 8]}>
          <planeGeometry args={[6, WALL_H]} />
          <meshStandardMaterial color="#cccccc" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh rotation={[0, -Math.PI / 2, 0]} position={[9, WALL_H / 2, 8]}>
          <planeGeometry args={[6, WALL_H]} />
          <meshStandardMaterial color="#cccccc" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, WALL_H / 2, 11]}>
          <planeGeometry args={[18, WALL_H]} />
          <meshStandardMaterial color="#bbbbbb" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, WALL_H / 2, 10.9]}>
          <planeGeometry args={[4, 6]} />
          <meshStandardMaterial color="#d8d8d8" roughness={0.05} metalness={0.9} />
        </mesh>
        {[-3, -2, -1, 0, 1, 2, 3].map((xi) => [-1, 0, 1].map((zi) => (
          <mesh key={`tile-${xi}-${zi}`} rotation={[-Math.PI / 2, 0, 0]} position={[xi * 2.5, 0.01, 8 + zi * 2]}>
            <planeGeometry args={[2.45, 1.95]} />
            <meshStandardMaterial color={Math.abs(xi + zi) % 2 === 0 ? "#d0d0d0" : "#b8b8b8"} roughness={0.2} metalness={0.1} />
          </mesh>
        )))}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_H - 0.05, 8]}>
          <planeGeometry args={[17, 5.6]} />
          <meshStandardMaterial color="#ffffff" emissive="#fff8f0" emissiveIntensity={0.6} />
        </mesh>
        <pointLight position={[0, 7, 8]} intensity={1.8} distance={10} color="#fff8f0" />
        {([-9, 9] as number[]).map((x) => (
          <mesh key={`etrim-${x}`} position={[x > 0 ? 8.95 : -8.95, WALL_H / 2, 8]}>
            <boxGeometry args={[0.06, WALL_H, 6]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        <mesh position={[0, 7.5, 5.5]}>
          <boxGeometry args={[1.2, 0.6, 0.05]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh position={[0, 7.5, 5.44]}>
          <planeGeometry args={[0.9, 0.35]} />
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.9} />
        </mesh>

        {/* ── MAIN CORRIDOR — keyed so geometry remounts when hall grows ── */}
        <mesh key={`floor-${hallLen}`}   rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, hallMidZ]}>
          <planeGeometry args={[HALL_W, hallLen]} />
          <meshStandardMaterial color="#e2e2e2" roughness={0.15} metalness={0.05} />
        </mesh>
        <mesh key={`ceiling-${hallLen}`} rotation={[Math.PI / 2, 0, 0]}  position={[0, WALL_H, hallMidZ]}>
          <planeGeometry args={[HALL_W, hallLen]} />
          <meshStandardMaterial color="#fafafa" roughness={0.9} />
        </mesh>
        <mesh key={`left-${hallLen}`}    rotation={[0, Math.PI / 2, 0]}  position={[-HALL_W / 2, WALL_H / 2, hallMidZ]}>
          <planeGeometry args={[hallLen, WALL_H]} />
          <meshStandardMaterial color="#d4d4d4" roughness={0.65} />
        </mesh>
        <mesh key={`right-${hallLen}`}   rotation={[0, -Math.PI / 2, 0]} position={[HALL_W / 2, WALL_H / 2, hallMidZ]}>
          <planeGeometry args={[hallLen, WALL_H]} />
          <meshStandardMaterial color="#d4d4d4" roughness={0.65} />
        </mesh>
        <mesh key={`bl-${hallLen}`}      rotation={[0, Math.PI / 2, 0]}  position={[-HALL_W / 2 + 0.05, 0.07, hallMidZ]}>
          <boxGeometry args={[hallLen, 0.14, 0.04]} />
          <meshStandardMaterial color="#b8b8b8" roughness={0.4} />
        </mesh>
        <mesh key={`br-${hallLen}`}      rotation={[0, -Math.PI / 2, 0]} position={[HALL_W / 2 - 0.05, 0.07, hallMidZ]}>
          <boxGeometry args={[hallLen, 0.14, 0.04]} />
          <meshStandardMaterial color="#b8b8b8" roughness={0.4} />
        </mesh>
        <mesh key={`strip-${hallLen}`}   rotation={[Math.PI / 2, 0, 0]}  position={[0, WALL_H - 0.01, hallMidZ]}>
          <planeGeometry args={[0.2, hallLen]} />
          <meshStandardMaterial color="#ffffff" emissive="#fffbf0" emissiveIntensity={0.5} />
        </mesh>

        {/* Purely visual chandeliers — no per-light pointLight */}
        {Array.from({ length: numLights }).map((_, i) => (
          <group key={`light-${i}-${hallLen}`}>
            <Chandelier position={[-4, WALL_H, HALL_START_Z - i * 10 - 3]} />
            <Chandelier position={[ 4, WALL_H, HALL_START_Z - i * 10 - 3]} />
          </group>
        ))}

        {/* ── BACK WALL + DOOR ── */}
        <mesh key={`backwall-${hallEndZ}`} position={[0, WALL_H / 2, hallEndZ]}>
          <planeGeometry args={[HALL_W, WALL_H]} />
          <meshStandardMaterial color="#cccccc" roughness={0.8} />
        </mesh>
        <Door key={`door-${hallEndZ}`} position={[0, 1.5, doorZ]} />

        {/* ── ARTWORK — each has its own Suspense so one bad image can't crash others ── */}
        {assignedArt.map((art) => (
          <Art
            key={art.id}
            position={art.slot.position}
            rotation={art.slot.rotation}
            image={art.image}
          />
        ))}
      </Canvas>

      {/* ── HUD ── */}
      <div style={{
        position: "absolute", bottom: 24, left: 24,
        background: "rgba(255,255,255,0.88)", backdropFilter: "blur(10px)",
        border: "1px solid rgba(0,0,0,0.07)", borderRadius: 2,
        padding: "16px 20px", zIndex: 100, minWidth: 220, fontFamily: "sans-serif",
      }}>
        <p style={{ fontSize: 10, color: "#999", letterSpacing: "0.15em", margin: "0 0 6px" }}>NAVIGATION</p>
        {isMobile ? (
          <p style={{ fontSize: 12, color: "#444", margin: "2px 0" }}>👆 Drag to look · Swipe up/down to walk</p>
        ) : (
          <>
            <p style={{ fontSize: 12, color: "#444", margin: "2px 0" }}>↑ ↓ &nbsp; Move forward / backward</p>
            <p style={{ fontSize: 12, color: "#444", margin: "2px 0" }}>← → &nbsp; Turn left / right</p>
            <p style={{ fontSize: 12, color: "#444", margin: "2px 0" }}>🖱 Mouse to look around</p>
          </>
        )}
        <p style={{ fontSize: 12, color: "#444", margin: "2px 0" }}>🚪 Door at the end of the hall</p>
        <div style={{ height: 1, background: "#eee", margin: "10px 0" }} />
        <p style={{ fontSize: 10, color: "#bbb", letterSpacing: "0.12em", margin: "0 0 8px" }}>
          COLLECTION — {wallArt.length} WORK{wallArt.length !== 1 ? "S" : ""}
        </p>
        <button
          onClick={handleClearGallery}
          disabled={clearing || loading}
          style={{
            width: "100%", background: "#111", color: "#fff",
            border: "none", borderRadius: 1, padding: "9px 12px",
            fontSize: 10, letterSpacing: "0.15em",
            cursor: clearing || loading ? "not-allowed" : "pointer",
            opacity: clearing || loading ? 0.4 : 1, transition: "opacity 0.2s",
          }}
        >
          {clearing ? "CLEARING..." : "CLEAR COLLECTION"}
        </button>
      </div>

      {/* ── Mobile walk buttons ── */}
      {isMobile && (
        <div style={{
          position: "absolute", bottom: 24, right: 24,
          display: "flex", flexDirection: "column", gap: 8, zIndex: 100,
        }}>
          <button
            onTouchStart={() => { moveRef.current =  1; }}
            onTouchEnd={()   => { moveRef.current =  0; }}
            style={mobileBtn}
          >▲</button>
          <button
            onTouchStart={() => { moveRef.current = -1; }}
            onTouchEnd={()   => { moveRef.current =  0; }}
            style={mobileBtn}
          >▼</button>
        </div>
      )}
    </div>
  );
}

const mobileBtn: React.CSSProperties = {
  width: 56, height: 56,
  background: "rgba(255,255,255,0.85)",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 4,
  fontSize: 22,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
  userSelect: "none",
  WebkitUserSelect: "none",
  touchAction: "none",
};