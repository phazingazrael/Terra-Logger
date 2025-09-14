/** biome-ignore-all lint/suspicious/noExplicitAny: explanation */
import { useEffect, useState } from "react";

export type DeviceType = "phone" | "tablet" | "desktop" | "unknown";

/**
 * Heuristic device detector that:
 * 1) Uses UA hints where trustworthy (Android / iOS),
 * 2) Handles iPadOS (which often identifies as "Mac"),
 * 3) Falls back to pointer + viewport size.
 *
 * Works fully client-side (Vite default).
 */
export function useDeviceType(): DeviceType {
  const [device, setDevice] = useState<DeviceType>("unknown");

  useEffect(() => {
    const classify = (): DeviceType => {
      if (typeof window === "undefined") return "unknown";

      const ua = navigator.userAgent || "";
      // const platform = (navigator as any).platform || "";
      const maxTouchPoints = navigator.maxTouchPoints || 0;

      // Chromium UA-CH (if available)
      // This only exposes "mobile" boolean; we use it as a hint, not a source of truth.
      const uaDataMobile =
        (navigator as any).userAgentData &&
          typeof (navigator as any).userAgentData.mobile === "boolean"
          ? (navigator as any).userAgentData.mobile
          : undefined;

      // --- Strong signals (OS + UA) ---
      const isAndroid = /Android/i.test(ua);
      const isIPhone = /iPhone/i.test(ua);
      const isIPadUA = /iPad/i.test(ua);
      // iPadOS 13+ identifying as "Mac" but touch-enabled
      const isModernIPad =
        !isIPadUA &&
        /Macintosh/i.test(ua) &&
        maxTouchPoints > 1; // iPad with desktop UA

      if (isIPhone) return "phone";
      if (isIPadUA || isModernIPad) return "tablet";

      if (isAndroid) {
        const isAndroidPhone = /Mobile/i.test(ua); // phones include "Mobile"
        return isAndroidPhone ? "phone" : "tablet"; // tablets usually omit "Mobile"
      }

      // --- UA-CH hint: treat "mobile" as phone unless viewport suggests tablet ---
      if (uaDataMobile === true) {
        // Some small tablets can appear "mobile" here; adjust by width.
        const w = getViewportMin();
        if (w >= 768) return "tablet";
        return "phone";
      }

      // --- Fallback: input + size heuristic ---
      // If pointer is coarse it's *likely* a handheld/touch device.
      const isCoarse =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(pointer: coarse)").matches;

      const minVp = getViewportMin(); // CSS pixels
      if (isCoarse) {
        if (minVp < 768) return "phone";
        if (minVp < 1024) return "tablet";
        // Large touch device (big tablet / touch laptop) – lean tablet.
        return "tablet";
      }

      return "desktop";
    };

    // Helper to avoid DPI pitfalls; use CSS pixel viewport, not physical screen.
    const getViewportMin = () => Math.min(window.innerWidth, window.innerHeight);

    // Debounce on resize/orientation changes
    let frame: number | null = null;
    const onChange = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setDevice(classify());
      });
    };

    setDevice(classify());
    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, []);

  return device;
}
