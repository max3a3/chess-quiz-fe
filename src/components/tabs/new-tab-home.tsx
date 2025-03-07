import { useAtom } from "jotai/react";
import { IconChess, IconPuzzle } from "@tabler/icons-react";

import { activeTabAtom, tabsAtom } from "@/state/atoms";
import { Tab } from "@/utils/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NewTabHome = ({ id }: { id: string }) => {
  const [, setTabs] = useAtom(tabsAtom);
  const [, setActiveTab] = useAtom(activeTabAtom);

  const cards = [
    {
      icon: <IconChess size={60} stroke={1.5} color="white" />,
      title: "Play Chess",
      description: "Play against an engine or a friend",
      label: "Play",
      onClick: () => {
        setTabs((prev: Tab[]) => {
          const tab = prev.find((t) => t.value === id);
          if (!tab) return prev;
          tab.name = "New Game";
          tab.type = "play";
          return [...prev];
        });
        setActiveTab(id);
      },
    },
    {
      icon: <IconPuzzle size={60} stroke={1.5} color="white" />,
      title: "Puzzles",
      description: "Train your chess skills",
      label: "Train",
      onClick: () => {
        setTabs((prev) => {
          const tab = prev.find((t) => t.value === id);
          if (!tab) return prev;
          tab.name = "Puzzle Training";
          tab.type = "puzzles";
          return [...prev];
        });
        setActiveTab(id);
      },
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="flex flex-col items-center gap-2 bg-main-box border-none"
        >
          <CardHeader className="w-full">
            <CardTitle className="text-white">{card.title}</CardTitle>
            <CardDescription className="text-main-text">
              {card.description}
            </CardDescription>
          </CardHeader>
          <CardContent>{card.icon}</CardContent>
          <CardFooter className="w-full">
            <Button
              className="w-full bg-main-button text-white transition-colors hover:bg-opacity-70"
              onClick={card.onClick}
            >
              {card.label}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default NewTabHome;
