import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { file } = await params;

  if (file !== path.basename(file)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const body = await readFile(path.join(process.cwd(), "css", file));
    return new NextResponse(body, {
      headers: { "Content-Type": "text/css; charset=utf-8" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
