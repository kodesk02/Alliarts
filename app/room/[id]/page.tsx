"use client";
import React, { use } from "react";
import { notFound } from "next/navigation";
import { rooms, frames } from "@/app/data/room";
import Image from "next/image";
import { Icon } from "@iconify/react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function RoomPage({ params }: Props) {
  const [frameOpen, setFrameOpen] = React.useState(false);
  const Params = use(params);
  const roomId = Params.id;
  const room = rooms.find((r) => r.id === roomId);
  const [selectedFrame, setSelectedFrame] = React.useState<
    (typeof frames)[0] | null
  >(null);
  const [hasSelectedFrame, setHasSelectedFrame] = React.useState(false);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setFrameOpen(true);
  }, []);

  const handleFrameClick = (frame: (typeof frames)[0]) => {
    setSelectedFrame(frame);

    if (!hasSelectedFrame) {
      setFrameOpen(false);
      setHasSelectedFrame(true);
    }
  };

  if (!room) {
    notFound();
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
  };

  const handleUploadClick = () => {
    const input = document.getElementById("fileInput");
    input?.click();
  };

  return (
    <main
      className="relative min-h-screen bg-white"
      style={{
        backgroundImage: `url(${room?.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <input
        id="fileInput"
        accept="image/*"
        type="file"
        onChange={handleUpload}
        className="hidden"
      />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 p-4">
        <button
          onClick={() => history.back()}
          className="bg-white/10 backdrop-blur-3xl px-4 text-(--brown) flex items-center gap-1 py-2 rounded-lg text-sm"
        >
          <Icon icon="weui:back-outlined" width="15" height="15" />
          Back
        </button>
      </div>

      {selectedFrame && room.framePosition && (
        <div
          onClick={() => setFrameOpen(true)}
          style={{
            top: room.framePosition.top,
            left: room.framePosition.left,
          }}
          className="absolute w-64 h-64 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
        >
          <div className="relative w-full h-full">
            {uploadedImage ? (
              <Image
                src={uploadedImage}
                alt="Uploaded Image"
                width={256}
                height={256}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-black/20" />
            )}

            <Image
              src={selectedFrame.image}
              alt={selectedFrame.name}
              width={256}
              height={256}
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />
          </div>
        </div>
      )}

      {frameOpen && (
        <div className="absolute bottom-0 left-0 w-full">
          <div className="flex justify-end text-(--brown)">
            <button
              onClick={() => setFrameOpen(false)}
              className="text-white font-bold"
            >
              <Icon icon="iconamoon:close-thin" width="40" height="40" />
            </button>
          </div>
          <div className="bg-white/10 background-blur-3xl py-3 shadow-lg rounded-xl">
            <div className="flex justify-center px-4">
              <div className="flex overflow-x-auto px-4 pb-2 mt-2 gap-4">
                {frames.map((frame) => (
                  <div
                    key={frame.id}
                    className="shrink-0 w-20 h-28 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => handleFrameClick(frame)}
                  >
                    <Image
                      src={frame.image}
                      alt={frame.name}
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!frameOpen && (
        <div className="absolute bottom-4 left-0 w-full flex justify-between items-center z-20 px-6">
          <button
            onClick={handleUploadClick}
            className="bg-white/10 backdrop-blur-3xl px-4 text-(--brown) flex items-center gap-1 py-2 rounded-lg text-sm"
          >
            <Icon icon="solar:upload-broken" width="40" height="40" />
          </button>
          <button
            onClick={() => setFrameOpen(true)}
            className="bg-white/10 backdrop-blur-3xl px-4 text-(--brown) flex items-center gap-1 py-2 rounded-lg text-sm"
          >
            <Icon icon="cil:filter-frames" width="40" height="40" />
          </button>
        </div>
      )}
    </main>
  );
}