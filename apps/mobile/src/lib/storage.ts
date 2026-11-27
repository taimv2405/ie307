import Storage from "expo-sqlite/kv-store";
import type { ZodType } from "zod";

type StorageKey = "colorScheme" | "language";

export function createStorageItem<T extends string>(
  key: StorageKey,
  schema: ZodType<T>,
) {
  return {
    get(): T | undefined {
      let stored: string | null;
      try {
        stored = Storage.getItemSync(key);
      } catch {
        // TODO: report read failures once the app has shared error reporting
        return undefined;
      }
      const result = schema.safeParse(stored);
      return result.success ? result.data : undefined;
    },
    set(value: T) {
      // TODO: handle write failures once the app has shared error reporting
      return Storage.setItem(key, value);
    },
  };
}
