"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <WifiOff className="w-8 h-8 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-xl font-semibold">Anda sedang offline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Periksa koneksi internet Anda, lalu coba lagi.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
      >
        Coba Lagi
      </button>
    </div>
  );
}
