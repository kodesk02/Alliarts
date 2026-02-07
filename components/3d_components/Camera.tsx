"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type CameraControllerProps = {
  maxZ?: number; // New prop to limit how far back you can go
};

export default function CameraController({ maxZ = -18 }: CameraControllerProps) {
  const { mouse } = useThree();

  // scroll position drives forward/back
  const [scrollY, setScrollY] = useState(0);

  // arrow keys velocity
  const moveVelocity = useRef(0); // forward/back
  const rotateVelocity = useRef(0); // left/right

  // target rotation for smooth camera look
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);

  /* ---------- SCROLL ---------- */
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- ARROW KEYS ---------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") moveVelocity.current = 40;
      if (e.key === "ArrowDown") moveVelocity.current = -40;
      if (e.key === "ArrowLeft") rotateVelocity.current = 1.5;
      if (e.key === "ArrowRight") rotateVelocity.current = -1.5;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown"].includes(e.key)) moveVelocity.current = 0;
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) rotateVelocity.current = 0;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  /* ---------- FRAME LOOP ---------- */
  useFrame((state, delta) => {
    const camera = state.camera;

    /* ---- 1. Forward/back movement ---- */
    if (moveVelocity.current !== 0) {
      setScrollY((prev) => prev - moveVelocity.current * delta);
    }

    // Dynamic clamping based on maxZ
    const targetZ = Math.max(5 - scrollY * 0.01, maxZ);
    camera.position.z += (targetZ - camera.position.z) * 0.08;

    /* ---- 2. Horizontal rotation (yaw) ---- */
    const maxYaw = Math.PI / 3; // ~60° left/right
    targetYaw.current = THREE.MathUtils.clamp(mouse.x * maxYaw + rotateVelocity.current * delta, -maxYaw, maxYaw);

    /* ---- 3. Vertical rotation (pitch) ---- */
    const maxPitch = 0.25; // ~14° up/down
    targetPitch.current = THREE.MathUtils.clamp(-mouse.y * maxPitch, -maxPitch, maxPitch);

    /* ---- 4. Update camera look ---- */
    const lookTarget = new THREE.Vector3();
    lookTarget.x = camera.position.x + Math.sin(targetYaw.current) * 5;
    lookTarget.y = 1.8 + targetPitch.current; // human-eye height
    lookTarget.z = camera.position.z - Math.cos(targetYaw.current) * 5;

    camera.lookAt(lookTarget);
  });

  return null;
}