"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileSpreadsheet, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Coop } from "@/types";

const REPORT_TYPES = [
  { value: "production", label: "Produksi Telur" },
  { value: "feed", label: "Manajemen Pakan" },
  { value: "health", label: "Kesehatan Ayam" },
  { value: "vaccination", label: "Vaksinasi" },
  { value: "population", label: "Populasi Kandang" },
];

interface ReportFilterFormProps {
  coops: Coop[];
}

export function ReportFilterForm({ coops }: ReportFilterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [type, setType] = useState(searchParams.get("type") ?? "production");
  const [from, setFrom] = useState(searchParams.get("from") ?? monthStart);
  const [to, setTo] = useState(searchParams.get("to") ?? today);
  const [coopId, setCoopId] = useState(searchParams.get("coopId") ?? "");

  const applyPreset = (preset: "today" | "7days" | "month") => {
    if (preset === "today") { setFrom(today); setTo(today); }
    if (preset === "7days") { setFrom(sevenDaysAgo); setTo(today); }
    if (preset === "month") { setFrom(monthStart); setTo(today); }
  };

  const buildParams = useCallback(() => {
    const p = new URLSearchParams({ type, from, to });
    if (coopId) p.set("coopId", coopId);
    return p.toString();
  }, [type, from, to, coopId]);

  function handleSearch() {
    router.push(`/reports?${buildParams()}`);
  }

  function exportUrl(format: "xlsx" | "pdf") {
    return `/api/reports/export?${buildParams()}&format=${format}`;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Jenis Laporan</Label>
          <Select value={type} onValueChange={(v) => setType(v ?? "production")}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Dari Tanggal</Label>
          <Input type="date" className="h-10" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Sampai Tanggal</Label>
          <Input type="date" className="h-10" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Kandang</Label>
          <Select value={coopId} onValueChange={(v) => setCoopId(v ?? "")}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Semua Kandang">
                {coopId ? coops.find((c) => c.id === coopId)?.name : "Semua Kandang"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Kandang</SelectItem>
              {coops.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center">Cepat:</span>
        {(["today", "7days", "month"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => applyPreset(p)}
            className="text-xs px-2.5 py-1 rounded-full border hover:bg-muted transition-colors"
          >
            {p === "today" ? "Hari Ini" : p === "7days" ? "7 Hari" : "Bulan Ini"}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSearch} className="gap-2 h-10">
          <Search className="w-4 h-4" />
          Tampilkan Data
        </Button>
        <a href={exportUrl("xlsx")} target="_blank" rel="noreferrer">
          <Button variant="outline" className="gap-2 h-10">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Excel
          </Button>
        </a>
        <a href={exportUrl("pdf")} target="_blank" rel="noreferrer">
          <Button variant="outline" className="gap-2 h-10">
            <FileText className="w-4 h-4 text-rose-600" />
            Export PDF
          </Button>
        </a>
      </div>
    </div>
  );
}
