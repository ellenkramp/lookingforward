import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid/non-secure";
import { differenceInHours, differenceInCalendarDays } from "date-fns";
import type { EventItem, CountdownUnit } from "./types";

export type Store = {
  events: EventItem[];
  addEvent: (title: string, targetISO: string, unit: CountdownUnit) => void;
  removeEvent: (id: string) => void;
  diff: (e: EventItem) => number;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      events: [],
      addEvent: (title, targetISO, unit) =>
        set((s) => ({
          events: [...s.events, { id: nanoid(), title, targetISO, unit }],
        })),
      removeEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      diff: (e) => {
        const now = new Date();
        const target = new Date(e.targetISO);
        return e.unit === "hours"
          ? differenceInHours(target, now)
          : differenceInCalendarDays(target, now);
      },
    }),
    { name: "countdown-store" }
  )
);
