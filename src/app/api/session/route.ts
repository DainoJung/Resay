import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function DELETE(req: NextRequest) {
  try {
    const { sessionId } = (await req.json()) as { sessionId: string };

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // Clean up stored audio from Supabase Storage (best effort)
    const storagePaths = [`${sessionId}.webm`, `${sessionId}.mp4`, `${sessionId}.aac`];
    await supabaseAdmin.storage.from("recordings").remove(storagePaths).catch(() => {});

    // Delete session (feedbacks + expressions cascade)
    const { error } = await supabaseAdmin
      .from("sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      console.error("Session delete error:", error);
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
