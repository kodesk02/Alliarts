import { NextResponse } from "next/server";
import { unlink, readdir, rm } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function DELETE() {
  try {
    // 1. Delete gallery.json
    const galleryDataPath = path.join(process.cwd(), "data", "gallery.json");
    if (existsSync(galleryDataPath)) {
      await unlink(galleryDataPath);
    }

    // 2. Delete all uploaded images
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (existsSync(uploadsDir)) {
      const files = await readdir(uploadsDir);
      for (const file of files) {
        await unlink(path.join(uploadsDir, file));
      }
    }

    return NextResponse.json({
      success: true,
      message: "Gallery cleared successfully",
    });
  } catch (error) {
    console.error("Clear gallery error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear gallery" },
      { status: 500 }
    );
  }
}