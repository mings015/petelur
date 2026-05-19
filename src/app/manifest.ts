import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Petelur — Manajemen Peternakan",
    short_name: "Petelur",
    description: "Sistem manajemen peternakan ayam petelur",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1E3A5F",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
