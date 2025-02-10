import { createFileRoute } from "@tanstack/react-router";
import { useAtom } from "jotai/react";
import { useCallback, useEffect } from "react";
import { PlusIcon } from "lucide-react";

import { activeTabAtom, tabsAtom } from "@/state/atoms";
import { createTab, Tab } from "@/utils/tabs";
import BoardTabTrigger from "@/components/board-tab-trigger";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ChessStateProvider from "@/provider/chess-state-context";
import BoardSection from "@/components/board-section";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  useEffect(() => {
    if (tabs.length === 0) {
      createTab({
        tab: { title: "New Game" },
        setTabs,
        setActiveTab,
      });
    }
  }, [tabs]);

  const closeTab = useCallback(
    (id: string) => {
      if (id === activeTab) {
        const index = tabs.findIndex((tab) => tab.id === id);
        if (tabs.length > 1) {
          if (index === tabs.length - 1) {
            setActiveTab(tabs[index - 1].id);
          } else {
            setActiveTab(tabs[index + 1].id);
          }
        } else {
          setActiveTab(null);
        }
      }
      setTabs((prev) => prev.filter((tab) => tab.id !== id));
    },
    [tabs, activeTab, setTabs, setActiveTab]
  );

  const selectTab = useCallback(
    (id: string) => {
      setActiveTab(id);
    },
    [setActiveTab]
  );

  const renameTab = useCallback(
    (id: string, title: string) => {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === id) {
            return { ...tab, title };
          }
          return tab;
        })
      );
    },
    [setTabs]
  );

  return (
    <Tabs value={activeTab || undefined} className="space-y-3 p-4">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <BoardTabTrigger
            key={tab.id}
            tab={tab}
            selected={tab.id === activeTab}
            selectTab={selectTab}
            renameTab={renameTab}
            closeTab={closeTab}
          />
        ))}
        <button
          onClick={() =>
            createTab({
              tab: {
                title: "New Game",
              },
              setTabs,
              setActiveTab,
            })
          }
          className="flex items-center justify-center size-10 border rounded-md transition-colors hover:bg-slate-100"
        >
          <PlusIcon className="size-5" />
        </button>
      </div>
      <div>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <TabSwitch tab={tab} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

function TabSwitch({ tab }: { tab: Tab }) {
  return (
    <ChessStateProvider id={tab.id}>
      <BoardSection />
    </ChessStateProvider>
  );
}
