"use client";

import { useWatch, type Control } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { dayLabel } from "@/lib/hours";
import type { StoreSettingsInput } from "@/lib/validations/store-settings";
import { DAYS, type Day } from "@/types/business-settings";

function DayRow({
  control,
  day,
  disabled,
}: {
  control: Control<StoreSettingsInput>;
  day: Day;
  disabled?: boolean;
}) {
  const isClosed = useWatch({ control, name: `businessHours.${day}.closed` });

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="w-24 shrink-0 font-medium">{dayLabel(day)}</span>

      <FormField
        control={control}
        name={`businessHours.${day}.closed`}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2">
            <FormControl>
              <Switch
                checked={!field.value}
                onCheckedChange={(checked) => field.onChange(!checked)}
                disabled={disabled}
              />
            </FormControl>
            <span className="text-muted-foreground w-12 text-xs">
              {field.value ? "Closed" : "Open"}
            </span>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`businessHours.${day}.open`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                type="time"
                className="w-28"
                disabled={disabled || isClosed}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <span className="text-muted-foreground">–</span>

      <FormField
        control={control}
        name={`businessHours.${day}.close`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                type="time"
                className="w-28"
                disabled={disabled || isClosed}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

export function BusinessHoursEditor({
  control,
  disabled,
}: {
  control: Control<StoreSettingsInput>;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2">
      {DAYS.map((day) => (
        <DayRow key={day} control={control} day={day} disabled={disabled} />
      ))}
    </div>
  );
}
