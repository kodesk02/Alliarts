'use client'

import Image from "next/image";
import { rooms } from "./data/room";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-foreground px-4 text-background">
      <div className="text-italic text-4xl font-light">
        Choose your room setting
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/room/${room.id}`}
            className="relative group overflow-hidden rounded-lg"
          >
            <Image
              src={room.image}
              alt={room.name}
              width={600}
              height={400}
              className="h-48 w-full object-cover transition-transform group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
