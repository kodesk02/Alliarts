"use client";

import Image from "next/image";
import { rooms } from "./data/room";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-linear-to-bl from-yellow-900 to-rose-900 px-4 text-background">
      <div className="text-italic text-4xl font-light">
        Choose your room setting
      </div>
      <div className="grid grid-cols-2 gap-1">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/room/${room.id}`}
            className="group overflow-hidden"
          >
              <Image
                src={room.image}
                alt={room.name}
                width={600}
                height={400}
                className={`relative h-48 w-full object-cover transition-transform group-hover:scale-105`}
              />
            <div className={`absolute group-hover:bg-black/10 group-hover:backdrop-blur-3xl group-hover:text-center group-hover:text-white ${room.name}`}/>
          </Link>
        ))}
      </div>
    </div>
  );
}
