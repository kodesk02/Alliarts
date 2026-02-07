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
  const doorRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const [opening, setOpening] = useState(false);
  const leftDoorRef = useRef<THREE.Mesh>(null!);
  const rightDoorRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!leftDoorRef.current || !rightDoorRef.current) return;

    // Animate door opening
    if (opening) {
      const targetRotation = Math.PI / 2;
      leftDoorRef.current.rotation.y = THREE.MathUtils.lerp(
        leftDoorRef.current.rotation.y,
        targetRotation,
        0.1
      );
      rightDoorRef.current.rotation.y = THREE.MathUtils.lerp(
        rightDoorRef.current.rotation.y,
        -targetRotation,
        0.1
      );
    }

    // Scale effect on hover
    const targetScale = hovered ? 1.02 : 1;
    doorRef.current.scale.x = THREE.MathUtils.lerp(
      doorRef.current.scale.x,
      targetScale,
      0.1
    );
    doorRef.current.scale.y = THREE.MathUtils.lerp(
      doorRef.current.scale.y,
      targetScale,
      0.1
    );
  });

  const handleClick = () => {
    setOpening(true);
    setTimeout(() => {
      router.push("/room");
    }, 500);
  };

  return (
    <group ref={doorRef} position={position}>
      {/* Door Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.2, 5.2, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Left Door */}
      <mesh
        ref={leftDoorRef}
        position={[-1, 0, 0.2]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        <boxGeometry args={[2, 5, 0.1]} />
        <meshStandardMaterial 
          color={hovered ? "#A0522D" : "#654321"} 
        />
      </mesh>

      {/* Right Door */}
      <mesh
        ref={rightDoorRef}
        position={[1, 0, 0.2]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        <boxGeometry args={[2, 5, 0.1]} />
        <meshStandardMaterial 
          color={hovered ? "#A0522D" : "#654321"} 
        />
      </mesh>

      {/* Door Knobs */}
      <mesh position={[-1.5, 0, 0.3]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1.5, 0, 0.3]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Sign above door */}
      {hovered && (
        <mesh position={[0, 3, 0.3]}>
          <planeGeometry args={[3, 0.5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
}