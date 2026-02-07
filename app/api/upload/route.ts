import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Define the types
type GalleryImage = {
  id: number;
  image: string;
  z: number;
  wall: "left" | "right";
  uploadedAt: string;
};

type GalleryData = {
  images: GalleryImage[];
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, "-");
    const filename = `${timestamp}-${originalName}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Load existing gallery data
    const galleryDataPath = path.join(process.cwd(), "data", "gallery.json");
    let galleryData: GalleryData = { images: [] };

    if (existsSync(galleryDataPath)) {
      const { readFile } = await import("fs/promises");
      const fileContent = await readFile(galleryDataPath, "utf-8");
      galleryData = JSON.parse(fileContent);
    } else {
      // Create data directory if it doesn't exist
      const dataDir = path.join(process.cwd(), "data");
      if (!existsSync(dataDir)) {
        await mkdir(dataDir, { recursive: true });
      }
    }

    // FIXED: Calculate position properly
    const imageCount = galleryData.images.length;
    
    // Alternate between left and right walls
    const wall: "left" | "right" = imageCount % 2 === 0 ? "left" : "right";
    
    // Calculate z position: each pair of images (left + right) moves 3 units deeper
    // Start at -2.5 for first left, -3.5 for first right, -5.5 for second left, etc.
    const START_Z = -2.5;
    const SPACING = 3;
    
    let zPosition: number;
    if (wall === "left") {
      // Left wall: 0, 2, 4, 6... → -2.5, -5.5, -8.5, -11.5...
      const leftIndex = Math.floor(imageCount / 2);
      zPosition = START_Z - (leftIndex * SPACING);
    } else {
      // Right wall: 1, 3, 5, 7... → -3.5, -6.5, -9.5, -12.5...
      const rightIndex = Math.floor((imageCount - 1) / 2);
      zPosition = START_Z - 1 - (rightIndex * SPACING);
    }

    // Add new image to gallery data
    const newImage: GalleryImage = {
      id: imageCount + 1,
      image: `/uploads/${filename}`,
      z: zPosition,
      wall: wall,
      uploadedAt: new Date().toISOString(),
    };

    galleryData.images.push(newImage);

    // Save updated gallery data
    await writeFile(
      galleryDataPath,
      JSON.stringify(galleryData, null, 2),
      "utf-8"
    );

    return NextResponse.json({
      success: true,
      image: newImage,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
}