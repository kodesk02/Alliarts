"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import * as THREE from "three";

type DoorProps = {
  position: [number, number, number];
};

export default function Door({ position }: DoorProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [opening, setOpening] = useState(false);
  const leftRef  = useRef<THREE.Mesh>(null!);
  const rightRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!leftRef.current || !rightRef.current) return;
    if (opening) {
      leftRef.current.rotation.y  = THREE.MathUtils.lerp(leftRef.current.rotation.y,  Math.PI / 2, 0.08);
      rightRef.current.rotation.y = THREE.MathUtils.lerp(rightRef.current.rotation.y, -Math.PI / 2, 0.08);
    }
  });

  const handleClick = () => {
    setOpening(true);
    setTimeout(() => router.push("/room"), 700);
  };

  const panelColor = hovered ? "#2a2a2a" : "#151515";

  return (
    <group position={position}>
      {/* Frame */}
      <mesh position={[0, 3.15, 0]}>
        <boxGeometry args={[2.5, 0.15, 0.2]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      <mesh position={[-1.2, 0, 0]}>
        <boxGeometry args={[0.15, 6.3, 0.2]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      <mesh position={[1.2, 0, 0]}>
        <boxGeometry args={[0.15, 6.3, 0.2]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>

      {/* Left panel */}
      <group position={[-1.125, 0, 0.05]}>
        <mesh
          ref={leftRef}
          position={[0.5625, 0, 0]}
          // onPointerOver/Out work on both desktop and mobile touch
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={handleClick}
        >
          <boxGeometry args={[1.125, 6.0, 0.07]} />
          <meshStandardMaterial color={panelColor} roughness={0.9} metalness={0.05} />
        </mesh>
      </group>

      {/* Right panel */}
      <group position={[1.125, 0, 0.05]}>
        <mesh
          ref={rightRef}
          position={[-0.5625, 0, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={handleClick}
        >
          <boxGeometry args={[1.125, 6.0, 0.07]} />
          <meshStandardMaterial color={panelColor} roughness={0.9} metalness={0.05} />
        </mesh>
      </group>

      {/* Handles */}
      <mesh position={[-0.18, 0.1, 0.12]}>
        <boxGeometry args={[0.04, 0.4, 0.04]} />
        <meshStandardMaterial color="#c8a96e" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0.18, 0.1, 0.12]}>
        <boxGeometry args={[0.04, 0.4, 0.04]} />
        <meshStandardMaterial color="#c8a96e" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Hover indicator */}
      {hovered && (
        <mesh position={[0, 3.05, 0.12]}>
          <boxGeometry args={[2.2, 0.06, 0.02]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      )}
    </group>
  );
}