import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";
import { reports } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/reports/history?id=<reportId>
// Generates a 1-hour signed URL for a stored scheduled report file
export async function GET(request: NextRequest) {
  try {
    await requireRole("owner");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

  const [report] = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  if (!report || !report.storagePath) {
    return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("reports")
    .createSignedUrl(report.storagePath, 3600);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Gagal membuat link unduhan" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
