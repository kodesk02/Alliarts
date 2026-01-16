"use client";
import React, { use } from "react";
import { notFound } from "next/navigation";
import { rooms, frames } from "@/app/data/room";
import Image from "next/image";
import { Icon } from "@iconify/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const [frameWidth, setFrameWidth] = React.useState("256");
  const [frameHeight, setFrameHeight] = React.useState("256");

  React.useEffect(() => {
    setFrameOpen(false);
  }, []);

  const handleFrameClick = (frame: (typeof frames)[0]) => {
    setSelectedFrame(frame);
    setHasSelectedFrame(true);
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

  // Size options
  const sizeOptions = [
    { value: "128", label: "128px" },
    { value: "192", label: "192px" },
    { value: "256", label: "256px" },
    { value: "320", label: "320px" },
    { value: "384", label: "384px" },
    { value: "448", label: "448px" },
    { value: "512", label: "512px" },
  ];

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
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
          }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
        >
          <div className="relative w-full h-full">
            {uploadedImage ? (
              <Image
                src={uploadedImage}
                alt="Uploaded Image"
                width={parseInt(frameWidth)}
                height={parseInt(frameHeight)}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-black/20" />
            )}

            <Image
              src={selectedFrame.image}
              alt={selectedFrame.name}
              width={parseInt(frameWidth)}
              height={parseInt(frameHeight)}
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />
          </div>
        </div>
      )}

      {frameOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setFrameOpen(false)}
          />

          {/* Modal container */}
          <div className="relative h-full w-full flex flex-col bg-black/30">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-white text-lg font-medium">Choose a frame</h2>
              <button
                onClick={() => setFrameOpen(false)}
                className="text-white"
              >
                <Icon icon="iconamoon:close-thin" width="36" height="36" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/6 overflow-y-auto">
                <div className="px-6 pb-10">
                  <div className="flex flex-col gap-6">
                    {frames.map((frame) => (
                      <div
                        key={frame.id}
                        onClick={() => handleFrameClick(frame)}
                        className={`cursor-pointer w-20 overflow-hidden bg-white/10 hover:bg-white/20 transition ${
                          selectedFrame?.id === frame.id ? "ring-2 ring-white" : ""
                        }`}
                      >
                        <Image
                          src={frame.image}
                          alt={frame.name}
                          width={300}
                          height={400}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-5/6 flex flex-col items-center justify-center gap-8 p-8">
                {/* Size Controls */}
                <div className="flex gap-6 items-end">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="width" className="text-white text-sm">
                      Width
                    </Label>
                    <Select disabled={!selectedFrame} value={frameWidth} onValueChange={setFrameWidth}>
                      <SelectTrigger id="width" className="w-32 bg-white/10 text-white border-white/20">
                        <SelectValue placeholder="Select width" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="height" className="text-white text-sm">
                      Height
                    </Label>
                    <Select disabled={!selectedFrame} value={frameHeight} onValueChange={setFrameHeight}>
                      <SelectTrigger id="height" className="w-32 bg-white/10 text-white border-white/20">
                        <SelectValue placeholder="Select height" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview Frame */}
                {selectedFrame && (
                  <div className="relative" style={{ width: `${frameWidth}px`, height: `${frameHeight}px` }}>
                    <div className="relative w-full h-full">
                      {uploadedImage ? (
                        <Image
                          src={uploadedImage}
                          alt="Uploaded Image"
                          width={parseInt(frameWidth)}
                          height={parseInt(frameHeight)}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-white/10" />
                      )}

                      <Image
                        src={selectedFrame.image}
                        alt={selectedFrame.name}
                        width={parseInt(frameWidth)}
                        height={parseInt(frameHeight)}
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                      />
                    </div>
                  </div>
                )}
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