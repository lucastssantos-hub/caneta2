"use client";

import { useEffect } from "react";

// Registra o service worker (PWA instalável + shell offline).
export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
