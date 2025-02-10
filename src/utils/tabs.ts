import { genID } from "@/lib/utils";

export type Tab = {
  id: string;
  title: string;
};

export function createTab({
  tab,
  setTabs,
  setActiveTab,
}: {
  tab: Omit<Tab, "id">;
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const id = genID();

  setTabs((tabs) => [...tabs, { id, ...tab }]);
  setActiveTab(id);
}
