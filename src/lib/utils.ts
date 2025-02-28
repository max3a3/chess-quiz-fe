import { clsx, type ClassValue } from "clsx";
import {
  AsyncStorage,
  AsyncStringStorage,
  SyncStorage,
  SyncStringStorage,
} from "jotai/vanilla/utils/atomWithStorage";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import localforage from "localforage";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const minMax = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

export function genID() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return S4() + S4();
}

export const indexedDBStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await localforage.getItem<string>(key);
    } catch (error) {
      console.error(`Error getting ${key} from IndexedDB`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await localforage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting ${key} in IndexedDB`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await localforage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from IndexedDB`, error);
    }
  },
};

export function createZodStorage<Value>(
  schema: z.ZodType<Value>,
  storage: SyncStringStorage
): SyncStorage<Value> {
  return {
    getItem(key, initialValue) {
      const storedValue = storage.getItem(key);
      if (storedValue === null) {
        return initialValue;
      }
      try {
        return schema.parse(JSON.parse(storedValue));
      } catch {
        this.setItem(key, initialValue);
        return initialValue;
      }
    },
    setItem(key, value) {
      storage.setItem(key, JSON.stringify(value));
    },
    removeItem(key) {
      storage.removeItem(key);
    },
  };
}

export function createAsyncZodStorage<Value>(
  schema: z.ZodType<Value>,
  storage: AsyncStringStorage
): AsyncStorage<Value> {
  return {
    async getItem(key, initialValue) {
      try {
        const storedValue = await storage.getItem(key);
        if (storedValue === null) {
          return initialValue;
        }
        const res = schema.safeParse(JSON.parse(storedValue));
        if (res.success) {
          return res.data;
        }
        console.error(`Invalid value for ${key}: ${storedValue}\n${res.error}`);
        await this.setItem(key, initialValue);
        return initialValue;
      } catch (error) {
        console.error(`Error getting ${key}: ${error}`);
        return initialValue;
      }
    },
    async setItem(key, value) {
      storage.setItem(key, JSON.stringify(value, null, 4));
    },
    async removeItem(key) {
      storage.removeItem(key);
    },
  };
}

export const sharedWasmMemory = (
  lo: number,
  hi = 32767
): WebAssembly.Memory => {
  let shrink = 4; // 32767 -> 24576 -> 16384 -> 12288 -> 8192 -> 6144 -> etc
  while (true) {
    try {
      return new WebAssembly.Memory({ shared: true, initial: lo, maximum: hi });
    } catch (e) {
      if (hi <= lo || !(e instanceof RangeError)) throw e;
      hi = Math.max(lo, Math.ceil(hi - hi / shrink));
      shrink = shrink === 4 ? 3 : 4;
    }
  }
};

export const defined = <T>(value: T | undefined): value is T =>
  value !== undefined;
