"use client";

import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { TextureLoader, DoubleSide } from "three";
import * as THREE from "three";

type ArtProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  image: string;
};

export default function Art({ position, rotation = [0, 0, 0], image }: ArtProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const { camera } = useThree();
  const texture = useLoader(TextureLoader, image);

  const targetScale = useRef(1);

  useFrame(() => {
    if (!groupRef.current) return;

    const artPos = groupRef.current.position;

    // --------- 1️⃣ Distance from camera ---------
    const distance = artPos.distanceTo(camera.position);

    // --------- 2️⃣ Scale based on distance ---------
    // If closer than 5 units, scale up to 1.1, else back to 1
    targetScale.current = distance < 5 ? 1.1 : 1.0;

    // Smooth interpolation (LERP)
    const currentScale = groupRef.current.scale.x;
    groupRef.current.scale.x += (targetScale.current - currentScale) * 0.05;
    groupRef.current.scale.y += (targetScale.current - currentScale) * 0.05;
    groupRef.current.scale.z += (targetScale.current - currentScale) * 0.05;

  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Frame */}
      <mesh position={[-0.02, 0, 0]}>
        <planeGeometry args={[2.1, 1.6]} />
        <meshStandardMaterial color="#000" side={DoubleSide} />
      </mesh>

      {/* Artwork */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial map={texture} side={DoubleSide} />
      </mesh>
    </group>
  );
}
