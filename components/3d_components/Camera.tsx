"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type CameraControllerProps = {
  minZ?: number;
  maxZ?: number;
};

export default function CameraController({ minZ = -57, maxZ = 6 }: CameraControllerProps) {
  const { mouse } = useThree();

  const posZ          = useRef(maxZ);
  const moveVelocity  = useRef(0);
  const rotateVelocity = useRef(0);
  const targetYaw     = useRef(0);
  const targetPitch   = useRef(0);

  const touchStart   = useRef({ x: 0, y: 0 });
  const touchCurrent = useRef({ x: 0, y: 0 });
  const isTouching   = useRef(false);

  // Two-finger pinch = move forward/back
  const pinchStart   = useRef(0);
  const pinchActive  = useRef(false);

  /* ── Touch ── */
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isTouching.current = true;
        pinchActive.current = false;
        touchStart.current   = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchCurrent.current = { ...touchStart.current };
      } else if (e.touches.length === 2) {
        // Two-finger: pinch to walk
        isTouching.current  = false;
        pinchActive.current = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStart.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isTouching.current && e.touches.length === 1) {
        touchCurrent.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        // Vertical drag = walk
        const dy = touchCurrent.current.y - touchStart.current.y;
        moveVelocity.current = -dy * 0.05;
      } else if (pinchActive.current && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = dist - pinchStart.current;
        posZ.current = THREE.MathUtils.clamp(posZ.current - delta * 0.02, minZ, maxZ);
        pinchStart.current = dist;
      }
    };

    const onTouchEnd = () => {
      isTouching.current  = false;
      pinchActive.current = false;
      moveVelocity.current = 0;
      touchStart.current   = { x: 0, y: 0 };
      touchCurrent.current = { x: 0, y: 0 };
    };

    // passive:true — doesn't block scrolling, required by Chrome mobile
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove",  onTouchMove,  { passive: true });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, [minZ, maxZ]);

  /* ── Keyboard ── */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp"    || e.key === "w" || e.key === "W") moveVelocity.current =  10;
      if (e.key === "ArrowDown"  || e.key === "s" || e.key === "S") moveVelocity.current = -10;
      if (e.key === "ArrowLeft"  || e.key === "a" || e.key === "A") rotateVelocity.current =  1.8;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") rotateVelocity.current = -1.8;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp","ArrowDown","w","W","s","S"].includes(e.key))        moveVelocity.current = 0;
      if (["ArrowLeft","ArrowRight","a","A","d","D"].includes(e.key)) rotateVelocity.current = 0;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
    };
  }, []);

  /* ── Frame ── */
  useFrame((state, delta) => {
    const camera = state.camera;

    posZ.current = THREE.MathUtils.clamp(
      posZ.current - moveVelocity.current * delta,
      minZ,
      maxZ
    );

    camera.position.z += (posZ.current          - camera.position.z) * 0.12;
    camera.position.x += (0                     - camera.position.x) * 0.04;
    camera.position.y += (1.8                   - camera.position.y) * 0.12;

    let yawInput   = 0;
    let pitchInput = 0;

    if (isTouching.current) {
      // Horizontal drag = look left/right
      yawInput   =  ((touchCurrent.current.x - touchStart.current.x) / window.innerWidth)  * 2;
      pitchInput = -((touchCurrent.current.y - touchStart.current.y) / window.innerHeight) * 0.5;
    } else {
      yawInput   =  mouse.x;
      pitchInput = -mouse.y;
    }

    const maxYaw = Math.PI / 2.5;
    targetYaw.current += rotateVelocity.current * delta;
    targetYaw.current  = THREE.MathUtils.clamp(
      yawInput * maxYaw + targetYaw.current * 0.02,
      -maxYaw, maxYaw
    );
    targetPitch.current = THREE.MathUtils.clamp(pitchInput * 0.35, -0.35, 0.35);

    camera.lookAt(
      camera.position.x + Math.sin(targetYaw.current) * 5,
      1.8 + targetPitch.current,
      camera.position.z - Math.cos(targetYaw.current) * 5
    );
  });

  return null;
}