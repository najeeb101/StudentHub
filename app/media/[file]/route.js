import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const CONTENT_TYPES = {
  ".avif": "image/avif",
  ".png": "image/png",
};

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { file } = await params;

  if (file !== path.basename(file)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const body = await readFile(path.join(process.cwd(), "media", file));
    return new NextResponse(body, {
      headers: { "Content-Type": CONTENT_TYPES[path.extname(file).toLowerCase()] || "application/octet-stream" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
