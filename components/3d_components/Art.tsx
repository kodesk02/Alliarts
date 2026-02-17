"use client";

import { useTexture } from "@react-three/drei";
import { Suspense } from "react";
import { FrontSide } from "three";

type ArtProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  image: string;
};

// Inner component — useTexture throws a Promise until loaded (Suspense protocol)
function ArtInner({ position, rotation = [0, 0, 0], image }: ArtProps) {
  const texture = useTexture(image);

  return (
    <group position={position} rotation={rotation}>
      {/* White frame */}
      <mesh position={[0, 0, -0.02]}>
         <planeGeometry args={[4.55, 4.35]} />
        <meshStandardMaterial color="#000000" side={FrontSide} roughness={0.5} />
      </mesh>
      {/* Mat */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[3.05, 4.35]} />
        <meshStandardMaterial color="#000000" side={FrontSide} roughness={0.6} />
      </mesh>
      {/* Artwork */}
      <mesh>
        <planeGeometry args={[4.35, 4.05]} />
        <meshStandardMaterial map={texture} side={FrontSide} roughness={0.4} />
      </mesh>
    </group>
  );
}

// Fallback shown while texture loads — just the white frame
function ArtFallback({ position, rotation = [0, 0, 0] }: Omit<ArtProps, "image">) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[2.95, 2.35]} />
        <meshStandardMaterial color="#eeeeee" side={FrontSide} roughness={0.5} />
      </mesh>
    </group>
  );
}

// Exported component — each artwork has its OWN Suspense so one bad image
// doesn't crash the others. If useTexture throws, this shows the fallback.
export default function Art(props: ArtProps) {
  return (
    <Suspense fallback={<ArtFallback position={props.position} rotation={props.rotation} />}>
      <ArtInner {...props} />
    </Suspense>
  );
}