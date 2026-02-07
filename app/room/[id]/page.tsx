"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { rooms, frames } from "@/app/data/room";
import { use } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function UploadPage({ params }: Props) {
  const router = useRouter();
  const Params = use(params);
  const roomId = Params.id;
  const room = rooms.find((r) => r.id === roomId);
  
  const [frameOpen, setFrameOpen] = React.useState(false);
  const [selectedFrame, setSelectedFrame] = React.useState<typeof frames[number] | null>(null);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [frameWidth, setFrameWidth] = React.useState("256");
  const [frameHeight, setFrameHeight] = React.useState("256");
  const [uploading, setUploading] = React.useState(false);

  // ... rest of your state (framePosition, isDragging, etc.)
  const [framePosition, setFramePosition] = React.useState({
    top: "30%",
    left: "40%",
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const frameRef = React.useRef<HTMLDivElement>(null);

  // ... all your existing functions (handleFrameClick, handleUpload, etc.)
  const handleFrameClick = (frame: typeof frames[number]) => {
    setSelectedFrame(frame);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setUploadedFile(file);
  };

  const handleUploadClick = () => {
    const input = document.getElementById("fileInput");
    input?.click();
  };

  const handleSaveToGallery = async () => {
    if (!uploadedFile) {
      alert("Please upload an image first");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert("Image saved to gallery! 🎨");
        router.push("/");
      } else {
        alert("Failed to save image: " + data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (frameOpen) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const rect = frameRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !frameRef.current) return;
      const container = frameRef.current.parentElement;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const frameWidthPx = parseInt(frameWidth);
      const frameHeightPx = parseInt(frameHeight);
      let newLeft = e.clientX - containerRect.left - dragStart.x;
      let newTop = e.clientY - containerRect.top - dragStart.y;
      const minLeft = 0;
      const maxLeft = containerRect.width - frameWidthPx;
      const minTop = 0;
      const maxTop = containerRect.height - frameHeightPx;
      newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
      newTop = Math.max(minTop, Math.min(newTop, maxTop));
      const leftPercent = (newLeft / containerRect.width) * 100;
      const topPercent = (newTop / containerRect.height) * 100;
      setFramePosition({
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
      });
    },
    [isDragging, dragStart, frameWidth, frameHeight]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (frameOpen) return;
    e.stopPropagation();
    setIsDragging(true);
    const touch = e.touches[0];
    const rect = frameRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
  };

  const handleTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !frameRef.current) return;
      e.preventDefault();
      const container = frameRef.current.parentElement;
      if (!container) return;
      const touch = e.touches[0];
      const containerRect = container.getBoundingClientRect();
      const frameWidthPx = parseInt(frameWidth);
      const frameHeightPx = parseInt(frameHeight);
      let newLeft = touch.clientX - containerRect.left - dragStart.x;
      let newTop = touch.clientY - containerRect.top - dragStart.y;
      const minLeft = 0;
      const maxLeft = containerRect.width - frameWidthPx;
      const minTop = 0;
      const maxTop = containerRect.height - frameHeightPx;
      newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
      newTop = Math.max(minTop, Math.min(newTop, maxTop));
      const leftPercent = (newLeft / containerRect.width) * 100;
      const topPercent = (newTop / containerRect.height) * 100;
      setFramePosition({
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
      });
    },
    [isDragging, dragStart, frameWidth, frameHeight]
  );

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e);
      const touchMoveHandler = (e: TouchEvent) => handleTouchMove(e);
      window.addEventListener("mousemove", mouseMoveHandler);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", touchMoveHandler, {
        passive: false,
      });
      window.addEventListener("touchend", handleTouchEnd);
      return () => {
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", touchMoveHandler);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove]);

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
        backgroundImage: `url(${room?.image})`, // THIS IS THE FIX
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Rest of your JSX stays the same */}
      <input
        id="fileInput"
        accept="image/*"
        type="file"
        onChange={handleUpload}
        className="hidden"
      />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 p-4 flex justify-between items-center">
        <button
          onClick={() => router.push("/room")}
          className="bg-white/10 backdrop-blur-3xl px-4 text-gray-800 flex items-center gap-1 py-2 rounded-lg text-sm hover:bg-white/20 transition"
        >
          <Icon icon="weui:back-outlined" width="15" height="15" />
          Back
        </button>

        {uploadedImage && (
          <button
            onClick={handleSaveToGallery}
            disabled={uploading}
            className="bg-green-500/90 backdrop-blur-3xl px-4 text-white flex items-center gap-2 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
          >
            {uploading ? (
              <>
                <Icon icon="eos-icons:loading" width="20" height="20" />
                Saving...
              </>
            ) : (
              <>
                <Icon icon="material-symbols:save" width="20" height="20" />
                Save to Gallery
              </>
            )}
          </button>
        )}
      </div>

      {/* All your existing JSX for frames, modal, etc. */}
      {selectedFrame && (
        <div
          ref={frameRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={(e) => {
            if (!isDragging) {
              e.stopPropagation();
              setFrameOpen(true);
            }
          }}
          style={{
            top: framePosition.top,
            left: framePosition.left,
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 select-none"
        >
          <div className="relative w-full h-full">
            {uploadedImage ? (
              <Image
                src={uploadedImage}
                alt="Uploaded Image"
                width={parseInt(frameWidth)}
                height={parseInt(frameHeight)}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
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
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setFrameOpen(false)}
          />
          <div className="relative h-full w-full flex flex-col bg-black/30">
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
              <h2 className="text-white text-base md:text-lg font-medium">
                Choose a frame
              </h2>
              <button onClick={() => setFrameOpen(false)} className="text-white">
                <Icon
                  icon="iconamoon:close-thin"
                  width="28"
                  height="28"
                  className="md:w-9 md:h-9"
                />
              </button>
            </div>
            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
              <div className="w-full md:w-1/6 overflow-y-auto overflow-x-auto md:overflow-x-hidden">
                <div className="px-4 md:px-6 pb-4 md:pb-10">
                  <div className="flex flex-row md:flex-col gap-3 md:gap-6">
                    {frames.map((frame) => (
                      <div
                        key={frame.id}
                        onClick={() => handleFrameClick(frame)}
                        className={`cursor-pointer w-16 md:w-20 flex-shrink-0 overflow-hidden bg-white/10 hover:bg-white/20 transition ${
                          selectedFrame?.id === frame.id
                            ? "ring-2 ring-white"
                            : ""
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
              <div className="w-full md:w-5/6 flex flex-col items-center justify-center gap-4 md:gap-8 p-4 md:p-8">
                <div className="flex gap-3 md:gap-6 items-end">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="width"
                      className="text-white text-xs md:text-sm"
                    >
                      Width
                    </Label>
                    <Select
                      disabled={!selectedFrame}
                      value={frameWidth}
                      onValueChange={setFrameWidth}
                    >
                      <SelectTrigger
                        id="width"
                        className="w-24 md:w-32 bg-white/10 text-white border-white/20 text-xs md:text-sm"
                      >
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
                    <Label
                      htmlFor="height"
                      className="text-white text-xs md:text-sm"
                    >
                      Height
                    </Label>
                    <Select
                      disabled={!selectedFrame}
                      value={frameHeight}
                      onValueChange={setFrameHeight}
                    >
                      <SelectTrigger
                        id="height"
                        className="w-24 md:w-32 bg-white/10 text-white border-white/20 text-xs md:text-sm"
                      >
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
                {selectedFrame && (
                  <div
                    className="relative max-w-full overflow-auto"
                    style={{
                      width: `min(${frameWidth}px, 100%)`,
                      height: `min(${frameHeight}px, 60vh)`,
                    }}
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
        <div className="absolute bottom-4 left-0 w-full flex justify-between items-center z-20 px-4 md:px-6">
          <button
            onClick={handleUploadClick}
            className="bg-white/10 backdrop-blur-3xl px-3 md:px-4 text-gray-800 flex items-center gap-1 py-2 rounded-lg text-sm hover:bg-white/20 transition"
          >
            <Icon
              icon="solar:upload-broken"
              width="32"
              height="32"
              className="md:w-10 md:h-10"
            />
          </button>
          <button
            onClick={() => setFrameOpen(true)}
            className="bg-white/10 backdrop-blur-3xl px-3 md:px-4 text-gray-800 flex items-center gap-1 py-2 rounded-lg text-sm hover:bg-white/20 transition"
          >
            <Icon
              icon="cil:filter-frames"
              width="32"
              height="32"
              className="md:w-10 md:h-10"
            />
          </button>
        </div>
      )}
    </main>
  );
}