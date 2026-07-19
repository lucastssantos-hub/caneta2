import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "GLP-1 Tracker",
  description: "Dieta e treino personalizados para quem usa GLP-1.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f6f1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
