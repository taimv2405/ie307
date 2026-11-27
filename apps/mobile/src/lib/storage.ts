import Storage from "expo-sqlite/kv-store";
import type { ZodType } from "zod";

type StorageKey = "colorScheme" | "language";

export function createStorageItem<T extends string>(
  key: StorageKey,
  schema: ZodType<T>,
) {
  return {
    get(): T | undefined {
      const result = schema.safeParse(Storage.getItemSync(key));
      return result.success ? result.data : undefined;
    },
    set(value: T) {
      return Storage.setItem(key, value);
    },
  };
}
