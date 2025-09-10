import { create } from "zustand";
import { loadEvents, insertEvent, deleteEvent } from "../db";

type Unit = "days" | "hours";
type Event = { id: string; title: string; iso: string; unit: Unit };

type Store = {
  events: Event[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addEvent: (title: string, iso: string, unit: Unit) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  diff: (e: Event) => number;
};

export const useStore = create<Store>((set, get) => ({
  events: [],
  hydrated: false,
  hydrate: async () => {
    const rows = await loadEvents();
    set({ events: rows, hydrated: true });
  },
  addEvent: async (title, iso, unit) => {
    const id = Math.random().toString(36).slice(2);
    const e = { id, title, iso, unit };
    await insertEvent(e);
    set((s) => ({ events: [...s.events, e] }));
  },
  removeEvent: async (id) => {
    await deleteEvent(id);
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
  },
  diff: (e) => {
    const ms = new Date(e.iso).getTime() - Date.now();
    return e.unit === "days"
      ? Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
      : Math.max(0, Math.ceil(ms / (1000 * 60 * 60)));
  },
}));
