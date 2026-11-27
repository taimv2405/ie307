import type { ReactNode } from "react";
import { View } from "react-native";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SettingsItem } from "./settings-item";

type SettingsSelectOption<T extends string> = {
  value: T;
  label: string;
  icon: ReactNode;
};

type SettingsSelectProps<T extends string> = {
  title: string;
  value: T | undefined;
  options: readonly SettingsSelectOption<T>[];
  onValueChange: (value: T) => void;
};

export function SettingsSelect<T extends string>({
  title,
  value,
  options,
  onValueChange,
}: SettingsSelectProps<T>) {
  const selected = options.find((option) => option.value === value);

  return (
    <SettingsItem title={title}>
      <Select
        value={selected}
        onValueChange={(picked) => {
          const option = options.find((item) => item.value === picked?.value);
          if (option) {
            onValueChange(option.value);
          }
        }}
      >
        <SelectTrigger
          aria-label={title}
          aria-valuetext={selected?.label}
          className="min-w-[140px]"
        >
          <View className="flex-row items-center gap-2">
            {selected && <View aria-hidden>{selected.icon}</View>}
            <SelectValue placeholder={title} />
          </View>
        </SelectTrigger>
        <SelectContent className="min-w-[140px]">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              label={option.label}
              value={option.value}
              icon={<View aria-hidden>{option.icon}</View>}
            />
          ))}
        </SelectContent>
      </Select>
    </SettingsItem>
  );
}
