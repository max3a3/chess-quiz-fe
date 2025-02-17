import { createFileRoute } from "@tanstack/react-router";
import { useAtom } from "jotai/react";
import { useCallback, useEffect } from "react";
import { PlusIcon } from "lucide-react";
import { match } from "ts-pattern";

import { activeTabAtom, tabsAtom } from "@/state/atoms";
import { createTab, Tab } from "@/utils/tabs";
import BoardTabTrigger from "@/components/tabs/board-tab-trigger";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ChessStateProvider from "@/provider/chess-state-context";
import NewTabHome from "@/components/tabs/new-tab-home";
import BoardGame from "@/components/tabs/board-game";
import Puzzles from "@/components/tabs/puzzles";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  useEffect(() => {
    if (tabs.length === 0) {
      createTab({
        tab: { name: "New Tab", type: "new" },
        setTabs,
        setActiveTab,
      });
    }
  }, [tabs, setActiveTab, setTabs]);

  const closeTab = useCallback(
    (value: string) => {
      if (value === activeTab) {
        const index = tabs.findIndex((tab) => tab.value === value);
        if (tabs.length > 1) {
          if (index === tabs.length - 1) {
            setActiveTab(tabs[index - 1].value);
          } else {
            setActiveTab(tabs[index + 1].value);
          }
        } else {
          setActiveTab(null);
        }
      }
      setTabs((prev) => prev.filter((tab) => tab.value !== value));
    },
    [tabs, activeTab, setTabs, setActiveTab]
  );

  const selectTab = useCallback(
    (value: string) => {
      setActiveTab(value);
    },
    [setActiveTab]
  );

  const renameTab = useCallback(
    (value: string, name: string) => {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.value === value) {
            return { ...tab, name };
          }
          return tab;
        })
      );
    },
    [setTabs]
  );

  return (
    <Tabs
      value={activeTab || undefined}
      onValueChange={(value) => setActiveTab(value)}
      className="space-y-3 p-4"
    >
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <BoardTabTrigger
            key={tab.value}
            tab={tab}
            selected={tab.value === activeTab}
            selectTab={selectTab}
            renameTab={renameTab}
            closeTab={closeTab}
          />
        ))}
        <button
          onClick={() =>
            createTab({
              tab: {
                name: "New Tab",
                type: "new",
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
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="focus:outline-none"
          >
            <TabSwitch tab={tab} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

function TabSwitch({ tab }: { tab: Tab }) {
  return match(tab.type)
    .with("new", () => <NewTabHome id={tab.value} />)
    .with("play", () => (
      <ChessStateProvider id={tab.value}>
        <BoardGame />
      </ChessStateProvider>
    ))
    .with("puzzles", () => (
      <ChessStateProvider id={tab.value}>
        <Puzzles id={tab.value} />
      </ChessStateProvider>
    ))
    .exhaustive();
}
