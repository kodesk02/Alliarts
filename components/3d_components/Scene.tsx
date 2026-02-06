"use client";

import { Canvas } from "@react-three/fiber";
import CameraController from "./Camera";
import Art from "./Art";

const wallArt = [
  {
    id: 1,
    image: "/images/1.png",
    z: -2.5,
    wall: "left",
  },
  {
    id: 2,
    image: "/images/1.png",
    z: -5.5,
    wall: "left",
  },
  {
    id: 3,
    image: "/images/1.png",
    z: -8.5,
    wall: "left",
  },
  {
    id: 4,
    image: "/images/1.png",
    z: -11.5,
    wall: "left",
  },
  {
    id: 5,
    image: "/images/1.png",
    z: -3.5,
    wall: "right",
  },
  {
    id: 6,
    image: "/images/1.png",
    z: -6.5,
    wall: "right",
  },
  {
    id: 7,
    image: "/images/1.png",
    z: -9.5,
    wall: "right",
  },
];

export default function Scene() {
  const START_Z = -2.5;
  const SPACING = 3;
  let rightIndex = 0;
  let leftIndex = 0;

  return (
    // 1. Canvas is to create the 3D world
    //  2. The camera.position is where the viewer stands
    //  3. fov(Field of View) is how wide the vision is, is in degrees
    <Canvas
      camera={{
        position: [0, 1, 5],
        fov: 60,
      }}
    >
      {/* Lights */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 13, 3]} color={"blue"} intensity={3} />

      {/* camera control */}
      <CameraController />

      {/* floor , ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        {/* flat rectangle width and depth */}
        <planeGeometry args={[20, 40]} />
        <meshStandardMaterial color="#e7d9d9" />
      </mesh>

      {/* left wall */}
      <mesh
        // allows the plane to turn inward , rootate around the y axis
        rotation={[0, Math.PI / 2, 0]}
        // position x,y,z [takes left side(-), stands on the floor (half the wall height), center]
        position={[-5, 1.5, 0]}
      >
        {/* lenght of the gallery and height */}
        <planeGeometry args={[40, 8]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* wall art for right amd left wall*/}
      {wallArt.map((art) => {
        const isLeft = art.wall === "left";
        const index = isLeft ? leftIndex++ : rightIndex++;
        const z = START_Z - index * SPACING;

        return (
          <Art
            key={art.id}
            // position={[isLeft ? -3.96 : 3.96, 2.8, z]}
            position={[isLeft ? -4 + 0.06 : 4 - 0.06, 2.8, z]}
            rotation={isLeft ? [0, Math.PI / 2, 0] : [0, -Math.PI / 2, 0]}
            image={art.image}
          />
        );
      })}

      {/* right wall */}
      <mesh
        // allows the plane to turn inward , rootate around the y axis
        rotation={[0, -Math.PI / 2, 0]}
        // position x,y,z [takes right side(+), stands on the floor (half the wall height), center]
        position={[5, 1.5, 0]}
      >
        {/* lenght of the gallery and height */}
        <planeGeometry args={[40, 8]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Closing the walls */}
      {/* Lenght of the experience (z) so -z = -20 is the end of the hall deeper into the world   */}
      <mesh position={[0, 1.5, -20]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </Canvas>
  );
}
