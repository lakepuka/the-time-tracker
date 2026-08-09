"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Never register in development. The cache is cache-first, which is correct
    // for the production build because its asset filenames are content-hashed —
    // but dev serves stable paths, so an edited stylesheet would be pinned to
    // the first version the browser ever saw.
    if (process.env.NODE_ENV !== "production") return;

    function register() {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // If the page has already loaded, the "load" event won't fire again —
    // register immediately; otherwise wait for load to avoid competing with it.
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
