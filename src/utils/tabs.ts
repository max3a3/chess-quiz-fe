import { z } from "zod";

import { genID } from "@/lib/utils";

export const tabSchema = z.object({
  name: z.string(),
  value: z.string(),
  type: z.enum(["new", "play", "analysis", "puzzles"]),
  gameNumber: z.number().nullish(),
});

export type Tab = z.infer<typeof tabSchema>;

export function createTab({
  tab,
  setTabs,
  setActiveTab,
}: {
  tab: Omit<Tab, "value">;
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const id = genID();

  setTabs((tabs) => [...tabs, { ...tab, value: id }]);
  setActiveTab(id);
}
