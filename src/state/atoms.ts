import { atomWithStorage, createJSONStorage } from "jotai/utils";

import { genID } from "@/lib/utils";
import { Tab } from "@/utils/tabs";

const firstTab: Tab = {
  id: genID(),
  title: "New Game",
};

export const tabsAtom = atomWithStorage<Tab[]>(
  "tabs",
  [firstTab],
  createJSONStorage(() => sessionStorage)
);

export const activeTabAtom = atomWithStorage<string | null>(
  "activeTab",
  firstTab.id,
  createJSONStorage(() => sessionStorage)
);
