import { NextResponse } from "next/server";
import { unlink, readdir, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function DELETE() {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const galleryDataPath = path.join(process.cwd(), "data", "gallery.json");

    // 1. Reset gallery.json to empty (DON'T DELETE IT)
    const dataDir = path.join(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    
    await writeFile(
      galleryDataPath,
      JSON.stringify({ images: [] }, null, 2),
      "utf-8"
    );

    // 2. Delete all uploaded images
    if (existsSync(uploadsDir)) {
      const files = await readdir(uploadsDir);
      
      await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(uploadsDir, file);
          try {
            await unlink(filePath);
          } catch (error) {
            console.error(`Failed to delete ${file}:`, error);
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      message: "Gallery cleared successfully",
    });
  } catch (error) {
    console.error("Clear gallery error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to clear gallery" 
      },
      { status: 500 }
    );
  }
}