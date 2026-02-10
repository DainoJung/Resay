import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const storagePath = req.nextUrl.searchParams.get("path");
  if (!storagePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from("recordings")
    .download(storagePath);

  if (error || !data) {
    console.error("Audio download error:", error);
    return NextResponse.json({ error: "Audio not found" }, { status: 404 });
  }

  const ext = storagePath.split(".").pop() || "webm";
  const contentType = `audio/${ext === "mp4" ? "mp4" : ext === "aac" ? "aac" : "webm"}`;

  return new NextResponse(data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
