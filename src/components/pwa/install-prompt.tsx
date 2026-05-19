"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("pwa-install-dismissed")) {
      setDismissed(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt || dismissed) return null;

  const handleInstall = async () => {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  return (
    <div className="mx-3 mt-3 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary leading-snug">Install Aplikasi</p>
        <p className="text-xs text-muted-foreground leading-snug">
          Pasang di HP untuk akses cepat & offline
        </p>
      </div>
      <button
        onClick={handleInstall}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shrink-0"
      >
        <Download className="w-3 h-3" />
        Install
      </button>
      <button onClick={handleDismiss} className="text-muted-foreground p-0.5 shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
