export type HoursMinutes = { hours: string; minutes: string };

export const weekdays = [
  { number: 1, code: "MO", label: "Monday" },
  { number: 2, code: "TU", label: "Tuesday" },
  { number: 3, code: "WE", label: "Wednesday" },
  { number: 4, code: "TH", label: "Thursday" },
  { number: 5, code: "FR", label: "Friday" },
  { number: 6, code: "SA", label: "Saturday" },
  { number: 7, code: "SU", label: "Sunday" },
] as const;

function indianGroups(value: string): string {
  if (value.length <= 3) return value;
  const tail = value.slice(-3);
  const head = value.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${head},${tail}`;
}

/** Converts a user-entered rupee amount into the API's exact minor-unit string. */
export function rupeesToMinor(value: string): string | null {
  const trimmed = value.trim();
  const match = /^(0|[1-9]\d{0,2}(?:,\d{3})*|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(trimmed);
  if (!match) return null;
  const [whole, decimal = ""] = trimmed.split(".");
  const paise = decimal.padEnd(2, "0");
  return (BigInt(whole.replaceAll(",", "")) * 100n + BigInt(paise || "0")).toString();
}

/** Formats the API's minor-unit string without converting it through a float. */
export function formatRupees(amountMinor: string | undefined): string {
  if (!amountMinor || !/^-?\d+$/.test(amountMinor)) return "Price not set";
  const value = BigInt(amountMinor);
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  return `${negative ? "-" : ""}₹${indianGroups((absolute / 100n).toString())}.${(absolute % 100n).toString().padStart(2, "0")}`;
}

export function hoursMinutesToSeconds({ hours, minutes }: HoursMinutes, positive = false): number | null {
  if (!/^\d+$/.test(hours) || !/^\d+$/.test(minutes)) return null;
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  if (!Number.isSafeInteger(parsedHours) || !Number.isInteger(parsedMinutes) || parsedMinutes < 0 || parsedMinutes > 59) return null;
  const total = parsedHours * 3600 + parsedMinutes * 60;
  if (!Number.isSafeInteger(total) || (positive && total <= 0)) return null;
  return total;
}

export function secondsToHoursMinutes(seconds: number): HoursMinutes | null {
  if (!Number.isSafeInteger(seconds) || seconds < 0) return null;
  const totalMinutes = Math.floor(seconds / 60);
  return { hours: String(Math.floor(totalMinutes / 60)).padStart(2, "0"), minutes: String(totalMinutes % 60).padStart(2, "0") };
}

export function formatDuration(seconds: number | undefined): string {
  const value = secondsToHoursMinutes(seconds ?? -1);
  return value ? `${value.hours} hr ${value.minutes} min` : "Not configured";
}

export function daysToSeconds(days: string): number | null {
  if (!/^\d+$/.test(days)) return null;
  const parsed = Number(days);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return null;
  const seconds = parsed * 86_400;
  return Number.isSafeInteger(seconds) ? seconds : null;
}

export function secondsToDays(seconds: number | undefined): string | null {
  if (seconds === undefined || !Number.isSafeInteger(seconds) || seconds < 0) return null;
  return String(Math.floor(seconds / 86_400));
}

export function timeToSeconds(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 ? hours * 3600 + minutes * 60 : null;
}

export function secondsToTime(seconds: number): string {
  if (!Number.isSafeInteger(seconds) || seconds < 0) return "Not configured";
  const hours = Math.floor(seconds / 3600) % 24;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function recurrenceFromDays(dayNumbers: number[]): string {
  const codes = weekdays.filter((day) => dayNumbers.includes(day.number)).map((day) => day.code);
  return `FREQ=WEEKLY;BYDAY=${codes.join(",")}`;
}

export function daysFromRecurrence(recurrence: string): number[] {
  const match = /^FREQ=WEEKLY;BYDAY=([A-Z,]+)$/.exec(recurrence);
  if (!match) return [];
  const codes = new Set(match[1].split(","));
  return weekdays.filter((day) => codes.has(day.code)).map((day) => day.number);
}
