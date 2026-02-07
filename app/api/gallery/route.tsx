import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET() {
  try {
    const galleryDataPath = path.join(process.cwd(), "data", "gallery.json");


    // Read gallery data
    const fileContent = await readFile(galleryDataPath, "utf-8");
    const galleryData = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      images: galleryData.images,
    });
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}