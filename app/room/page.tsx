"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { rooms } from "../data/room";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-linear-to-r from-neutral-900 to-gray-600 text-background">
      <div className="text-xl pt-10 md:py-0 flex items-center md:text-4xl font-light mb-10">
        <Icon icon={"ph:flower-lotus-fill"} />
        <span>Choose your room setting</span>
        <Icon icon={"ph:flower-lotus-fill"} />
      </div>
      <div className=" min-w-screen items-center justify-center flex">
        <div className="block md:flex w-full">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/room/${room.id}`}
              className={`group relative overaflow-hidden shadow-2xl`}
              style={{
                zIndex: room.z,
              }}
            >
              <Image
                src={room.image}
                alt={room.name}
                width={600}
                height={400}
                className="h-120 relative w-full md:mt-0 mt-10 object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 z-20 flex items-end px-1 py-1">
                <h2 className="hidden md:block absolute top-2 left-2 text-sm font-semibold text-white">
                  {room.type}
                </h2>
                <h2 className="absolute bottom-2 right-2 text-sm tracking-widest font-semibold text-white [writing-mode:vertical-rl]">
                  {room.name}
                </h2>
              </div>

              {/* Overlay */}
              <div
                className="absolute w-full inset-0 md:mt-0 mt-10 flex items-center justify-center
                      group-hover:bg-black/30
                      group-hover:backdrop-blur-xs transition-transform duration-300 group-hover:scale-105"
              ></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
