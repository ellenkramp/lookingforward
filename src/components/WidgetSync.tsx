// src/components/WidgetSync.tsx
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useStore } from "@/store";
import { writeShared, reloadWidgets } from "@/widget/bridge";

export default function WidgetSync() {
  const events = useStore((s) => s.events);
  const timer = useRef<NodeJS.Timeout | null>(null);

  // Throttle a bit so we don't spam the OS
  const scheduleSync = (evts = events, delay = 300) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await writeShared(evts); // write the latest events JSON
      await reloadWidgets(); // tell iOS/Android to refresh
    }, delay);
  };

  // 1) push every time events change
  useEffect(() => {
    scheduleSync(events, 0);
  }, [events]);

  // 2) also push when app returns to foreground (time may have advanced)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") scheduleSync();
    });
    return () => sub.remove();
  }, []);

  // 3) first mount (creates file on fresh install)
  useEffect(() => {
    scheduleSync(events, 0);
  }, []);

  return null;
}
