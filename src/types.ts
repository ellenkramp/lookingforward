export type CountdownUnit = "days" | "hours";
export type EventItem = {
  id: string;
  title: string;
  targetISO: string; // e.g. 2025-12-25T00:00:00.000Z
  unit: CountdownUnit;
};
