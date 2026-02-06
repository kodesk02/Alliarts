"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function CameraController() {
  const { mouse } = useThree();

  const [scrollY, setScrollY] = useState(0);
  const keyVelocity = useRef(0); // arrow up/down
  const rotationVelocity = useRef(0); // arrow left/right

  const lookTarget = useRef(new THREE.Vector3(0, 1.8, 0));

  /* ---------- SCROLL ---------- */
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- ARROW KEYS ---------- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") keyVelocity.current = 40;
      if (e.key === "ArrowDown") keyVelocity.current = -40;
      if (e.key === "ArrowLeft") rotationVelocity.current = 1.5;
      if (e.key === "ArrowRight") rotationVelocity.current = -1.5;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown"].includes(e.key)) keyVelocity.current = 0;
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) rotationVelocity.current = 0;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  /* ---------- FRAME LOOP ---------- */
  useFrame((state, delta) => {
    const camera = state.camera;

    /* ---- 1. Forward/back movement ---- */
    if (keyVelocity.current !== 0) {
      setScrollY((prev) => prev - keyVelocity.current * delta);
    }
    const targetZ = Math.max(5 - scrollY * 0.01, -18);
    camera.position.z += (targetZ - camera.position.z) * 0.08;

    /* ---- 2. Mouse & arrow rotation ---- */
    const maxYaw = Math.PI / 3; // ~60° left/right
    const maxPitch = 0.25; // slight up/down

    // combine mouse and arrow keys
    const yaw = THREE.MathUtils.clamp(mouse.x * maxYaw + rotationVelocity.current * delta, -maxYaw, maxYaw);
    const pitch = THREE.MathUtils.clamp(-mouse.y * maxPitch, -maxPitch, maxPitch);

    lookTarget.current.x = camera.position.x + Math.sin(yaw) * 5;
    lookTarget.current.y = 1.8 + pitch;
    lookTarget.current.z = camera.position.z - Math.cos(yaw) * 5;

    /* ---- 3. Camera looks at the target ---- */
    camera.lookAt(lookTarget.current);
  });

  return null;
}
