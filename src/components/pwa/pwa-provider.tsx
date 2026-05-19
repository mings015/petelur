"use client";

import { useEffect } from "react";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { OfflineBanner } from "./offline-banner";
import { InstallPrompt } from "./install-prompt";

export function PwaProvider() {
  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const syncState = useOfflineSync();

  return (
    <>
      <OfflineBanner syncState={syncState} />
      <InstallPrompt />
    </>
  );
}
