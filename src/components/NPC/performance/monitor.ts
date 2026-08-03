import type { NPCPerformanceDiagnostics } from "../types";

export function startNPCPerformanceMonitor(diagnostics: NPCPerformanceDiagnostics): () => void {
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const interval = 1000;
  const schedule = () => {
    const expectedAt = performance.now() + interval;
    timer = setTimeout(() => {
      const observedAt = performance.now();
      const delayMs = observedAt - expectedAt;
      if (delayMs >= 250) diagnostics.watchdogDelays.push({ expectedAt, observedAt, delayMs });
      if (!disposed) schedule();
    }, interval);
  };
  schedule();

  let observer: PerformanceObserver | undefined;
  try {
    if (typeof PerformanceObserver !== "undefined" && PerformanceObserver.supportedEntryTypes?.includes("longtask")) {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) diagnostics.longTasks.push({ startTime: entry.startTime, duration: entry.duration });
      });
      observer.observe({ entryTypes: ["longtask"] });
    }
  } catch {
    observer = undefined;
  }

  return () => {
    disposed = true;
    if (timer) clearTimeout(timer);
    observer?.disconnect();
  };
}
