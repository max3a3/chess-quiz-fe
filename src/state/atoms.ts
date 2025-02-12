import { z } from "zod";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

import { createZodStorage, genID } from "@/lib/utils";
import { Tab, tabSchema } from "@/utils/tabs";

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
