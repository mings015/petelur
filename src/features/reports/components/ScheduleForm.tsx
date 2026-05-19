"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createSchedule } from "../actions";
import { Button } from "@/components/ui/button";
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

interface ScheduleFormProps {
  coops: Coop[];
}

export function ScheduleForm({ coops }: ScheduleFormProps) {
  const [type, setType] = useState("production");
  const [frequency, setFrequency] = useState("daily");
  const [format, setFormat] = useState("xlsx");
  const [coopId, setCoopId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.set("type", type);
    formData.set("frequency", frequency);
    formData.set("format", format);
    if (coopId) formData.set("coopId", coopId);

    const result = await createSchedule(formData);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Jadwal laporan berhasil dibuat");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Jenis Laporan</Label>
          <Select value={type} onValueChange={(v) => setType(v ?? "production")}>
            <SelectTrigger className="h-10">
              <SelectValue>{REPORT_TYPES.find((t) => t.value === type)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Frekuensi</Label>
          <Select value={frequency} onValueChange={(v) => setFrequency(v ?? "daily")}>
            <SelectTrigger className="h-10">
              <SelectValue>
                {frequency === "daily" ? "Harian" : frequency === "weekly" ? "Mingguan" : "Bulanan"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Harian</SelectItem>
              <SelectItem value="weekly">Mingguan</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v ?? "xlsx")}>
            <SelectTrigger className="h-10">
              <SelectValue>{format === "xlsx" ? "Excel (.xlsx)" : "PDF"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
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

      <Button type="submit" disabled={isLoading} className="h-10 gap-2">
        {isLoading ? "Menyimpan..." : "+ Tambah Jadwal"}
      </Button>
    </form>
  );
}
