import { NextRequest, NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/supabase/auth";
import { createProduction } from "@/features/production/actions";
import { recordFeedUsage } from "@/features/feed/actions";
import { createHealthRecord } from "@/features/health/actions";

type SyncPayload = {
  type: "production" | "feed_usage" | "health";
  payload: Record<string, string>;
};

function toFormData(payload: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(payload)) fd.set(k, v);
  return fd;
}

export async function POST(request: NextRequest) {
  try {
    await requireAnyRole(["owner", "worker"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: SyncPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, payload } = body;
  const formData = toFormData(payload);

  let result: { success: boolean; error?: string };

  if (type === "production") {
    result = await createProduction(formData);
  } else if (type === "feed_usage") {
    result = await recordFeedUsage(formData);
  } else if (type === "health") {
    result = await createHealthRecord(formData);
  } else {
    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
