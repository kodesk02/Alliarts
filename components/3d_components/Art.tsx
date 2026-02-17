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
    const distance = groupRef.current.position.distanceTo(camera.position);
    targetScale.current = distance < 5 ? 1.03 : 1.0;
    const s = groupRef.current.scale.x;
    const ns = s + (targetScale.current - s) * 0.05;
    groupRef.current.scale.set(ns, ns, ns);
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Shadow/depth backing */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[3.1, 2.5]} />
        <meshStandardMaterial color="#c0c0c0" side={DoubleSide} transparent opacity={0.3} />
      </mesh>

      {/* White frame */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[4.55, 4.35]} />
        <meshStandardMaterial color="#000000" side={DoubleSide} roughness={0.5} />
      </mesh>

      {/* Off-white mat */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[3.05, 4.35]} />
        <meshStandardMaterial color="#000000" side={DoubleSide} roughness={0.6} />
      </mesh>

      {/* Artwork */}
      <mesh>
        <planeGeometry args={[4.35, 4.05]} />
        <meshStandardMaterial map={texture} side={DoubleSide} roughness={0.4} />
      </mesh>
    </group>
  );
}