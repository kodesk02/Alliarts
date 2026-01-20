"use client";

import Image from "next/image";
import { rooms } from "./data/room";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-(--brown) text-background">
      <div className="text-xl flex items-center gap-2 md:text-4xl font-light mb-10">
        <Icon icon={"ph:flower-lotus-fill"} />
        <span>Choose your room setting</span>
        <Icon icon={"ph:flower-lotus-fill"} />
      </div>
      <div className="bg-(--light-brown) min-w-screen items-center justify-center flex p-10">
        <div className="block md:flex gap-2 w-full max-w-4xl">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/room/${room.id}`}
              className={`group relative overflow-hidden rounded-2xl shadow-2xl`}
              style={{
                zIndex: room.z,
              }}
            >
              <Image
                src={room.image}
                alt={room.name}
                width={600}
                height={400}
                className="h-94 w-full md:mt-0 mt-10 object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
              />

              {/* Overlay */}
              <div
                className="absolute w-full inset-0 md:mt-0 mt-10 flex rounded-2xl items-center justify-center
                      group-hover:bg-black/30
                      group-hover:backdrop-blur-md transition-transform duration-300 group-hover:scale-105"
              >
                <span className="text-white text-lg font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {room.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
