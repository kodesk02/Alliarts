import { useLoader } from "@react-three/fiber";
import React from "react";
import { DoubleSide, TextureLoader } from "three";

type ArtProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  image: string;
};

export default function Art({ position, image, rotation }: ArtProps) {
  const texture = useLoader(TextureLoader, image);
  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh position={[-0.02, 0, 0]}>
        <planeGeometry args={[2.1, 1.6]} />
        <meshStandardMaterial color="#000" side={DoubleSide}/>
      </mesh>

      {/* Artwork  */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial map={texture} side={DoubleSide}/>
      </mesh>
    </group>
  );
}
