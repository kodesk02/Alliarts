"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type CameraControllerProps = {
  minZ?: number; // furthest point (most negative z)
  maxZ?: number; // starting point (most positive z)
};

export default function CameraController({ minZ = -57, maxZ = 6 }: CameraControllerProps) {
  const { mouse } = useThree();

  const posZ = useRef(maxZ);
  const moveVelocity = useRef(0);
  const rotateVelocity = useRef(0);
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);

  const touchStart = useRef({ x: 0, y: 0 });
  const touchCurrent = useRef({ x: 0, y: 0 });
  const isTouching = useRef(false);

  /* ── Touch controls ── */
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isTouching.current = true;
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchCurrent.current = { ...touchStart.current };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isTouching.current && e.touches.length === 1)
        touchCurrent.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isTouching.current = false;
      touchStart.current = { x: 0, y: 0 };
      touchCurrent.current = { x: 0, y: 0 };
    };
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  /* ── Arrow / WASD keys ── */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") moveVelocity.current = 10;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") moveVelocity.current = -10;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") rotateVelocity.current = 1.8;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") rotateVelocity.current = -1.8;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "w", "W", "s", "S"].includes(e.key)) moveVelocity.current = 0;
      if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(e.key)) rotateVelocity.current = 0;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  /* ── Per-frame update ── */
  useFrame((state, delta) => {
    const camera = state.camera;

    // Move forward/back — clamped between minZ and maxZ
    posZ.current = THREE.MathUtils.clamp(
      posZ.current - moveVelocity.current * delta,
      minZ,
      maxZ
    );

    // Smoothly interpolate camera position
    camera.position.z += (posZ.current - camera.position.z) * 0.12;
    camera.position.x += (0 - camera.position.x) * 0.04; // keep centered on X
    camera.position.y += (1.8 - camera.position.y) * 0.12;

    // Rotation input source
    let yawInput = 0;
    let pitchInput = 0;

    if (isTouching.current) {
      yawInput = ((touchCurrent.current.x - touchStart.current.x) / window.innerWidth) * 2;
      pitchInput = -(((touchCurrent.current.y - touchStart.current.y) / window.innerHeight) * 2);
    } else {
      yawInput = mouse.x;
      pitchInput = -mouse.y;
    }

    // Update yaw from both mouse and key rotation
    const maxYaw = Math.PI / 2.5;
    targetYaw.current += rotateVelocity.current * delta;
    targetYaw.current = THREE.MathUtils.clamp(
      yawInput * maxYaw + targetYaw.current * 0.02, // blend key-accumulated yaw with mouse
      -maxYaw,
      maxYaw
    );

    // Pitch
    targetPitch.current = THREE.MathUtils.clamp(pitchInput * 0.35, -0.35, 0.35);

    // Look target
    const lookTarget = new THREE.Vector3(
      camera.position.x + Math.sin(targetYaw.current) * 5,
      1.8 + targetPitch.current,
      camera.position.z - Math.cos(targetYaw.current) * 5
    );
    camera.lookAt(lookTarget);
  });

  return null;
}