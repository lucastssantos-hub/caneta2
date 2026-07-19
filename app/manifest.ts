import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GLP-1 Tracker",
    short_name: "GLP-1",
    description: "Dieta e treino personalizados para quem usa GLP-1.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f1216",
    theme_color: "#0f1216",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
