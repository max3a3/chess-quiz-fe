import { z } from "zod";
import { atomFamily, atomWithStorage, createJSONStorage } from "jotai/utils";

import { createZodStorage, genID } from "@/lib/utils";
import { Tab, tabSchema } from "@/utils/tabs";
import { atom, PrimitiveAtom } from "jotai/vanilla";
import { AtomFamily } from "jotai/vanilla/utils/atomFamily";

const firstTab: Tab = {
  name: "New Tab",
  value: genID(),
  type: "new",
};

export const tabsAtom = atomWithStorage<Tab[]>(
  "tabs",
  [firstTab],
  createZodStorage(z.array(tabSchema), sessionStorage)
);

export const activeTabAtom = atomWithStorage<string | null>(
  "activeTab",
  firstTab.value,
  createJSONStorage(() => sessionStorage)
);

export const currentTabAtom = atom(
  (get) => {
    const tabs = get(tabsAtom);
    const activeTab = get(activeTabAtom);
    return tabs.find((tab) => tab.value === activeTab);
  },
  (get, set, newValue: Tab | ((currentTab: Tab) => Tab)) => {
    const tabs = get(tabsAtom);
    const activeTab = get(activeTabAtom);
    const nextValue =
      typeof newValue === "function"
        ? newValue(get(currentTabAtom)!)
        : newValue;
    const newTabs = tabs.map((tab) => {
      if (tab.value === activeTab) {
        return nextValue;
      }
      return tab;
    });
    set(tabsAtom, newTabs);
  }
);

const currentPuzzleFamily = atomFamily((_: string) => atom(0));
export const currentPuzzleAtom = tabValue(currentPuzzleFamily);

function tabValue<
  T extends object | string | boolean | number | null | undefined,
>(family: AtomFamily<string, PrimitiveAtom<T>>) {
  return atom(
    (get) => {
      const tab = get(currentTabAtom);
      if (!tab) throw new Error("No tab selected");
      const atom = family(tab.value);
      return get(atom);
    },
    (get, set, newValue: T | ((currentValue: T) => T)) => {
      const tab = get(currentTabAtom);
      if (!tab) throw new Error("No tab selected");
      const nextValue =
        typeof newValue === "function"
          ? newValue(get(tabValue(family)))
          : newValue;
      const atom = family(tab.value);
      set(atom, nextValue);
    }
  );
}
