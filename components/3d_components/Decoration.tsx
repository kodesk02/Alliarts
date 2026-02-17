"use client";

type DecorationProps = {
  position: [number, number, number];
  type: "pedestal" | "vase" | "plant";
};

export default function Decoration({ position, type }: DecorationProps) {
  return null;
}