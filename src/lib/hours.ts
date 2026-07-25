import {
  DAYS,
  type BusinessHours,
  type Day,
  type DayHours,
} from "@/types/business-settings";

const DEFAULT_DAY_HOURS: DayHours = {
  open: "09:00",
  close: "17:00",
  closed: false,
};

// business_hours starts as {} until an owner configures it — this fills in
// sensible defaults for any day that hasn't been set yet, so the form
// always has a complete 7-day shape to bind to.
export function withDefaultHours(
  stored: Partial<BusinessHours> | null | undefined,
): BusinessHours {
  return DAYS.reduce((hours, day) => {
    hours[day] = stored?.[day] ?? { ...DEFAULT_DAY_HOURS };
    return hours;
  }, {} as BusinessHours);
}

const DAY_LABELS: Record<Day, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function dayLabel(day: Day): string {
  return DAY_LABELS[day];
}

function formatTime(value: string): string {
  const [hoursStr, minutes] = value.split(":");
  const hours = Number(hoursStr);
  if (Number.isNaN(hours)) return value;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${period}`;
}

export function formatDayHours(hours: DayHours): string {
  if (hours.closed) return "Closed";
  return `${formatTime(hours.open)} – ${formatTime(hours.close)}`;
}

export function todayKey(): Day {
  // getDay(): 0 = Sunday ... 6 = Saturday
  const index = new Date().getDay();
  return DAYS[(index + 6) % 7];
}
