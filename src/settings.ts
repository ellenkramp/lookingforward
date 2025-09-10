// src/settings.ts
import { create } from "zustand";
export type FontChoice = "system" | "inter" | "bebas" | "script";
export const useSettings = create<{
  font: FontChoice;
  monoDigits: boolean;
  set: (s: Partial<any>) => void;
}>((set) => ({
  font: "system",
  monoDigits: true,
  set,
}));
