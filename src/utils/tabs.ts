import { z } from "zod";

import { genID } from "@/lib/utils";

export const tabSchema = z.object({
  name: z.string(),
  value: z.string(),
  type: z.enum(["new", "play", "puzzles"]),
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

  setTabs((prev) => {
    if (
      prev.length === 0 ||
      (prev.length === 1 && prev[0].type === "new" && tab.type !== "new")
    ) {
      return [
        {
          ...tab,
          value: id,
        },
      ];
    }
    return [
      ...prev,
      {
        ...tab,
        value: id,
      },
    ];
  });
  setActiveTab(id);
  return id;
}
