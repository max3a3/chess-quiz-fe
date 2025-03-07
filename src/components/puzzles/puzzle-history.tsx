import { IconCheck, IconDots, IconX } from "@tabler/icons-react";
import { match } from "ts-pattern";

import { cn } from "@/lib/utils";
import { Completion } from "@/utils/puzzles";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type History = {
  completion: Completion;
  label?: string;
  value: string;
};

interface PuzzleHistoryProps {
  histories: History[];
  onSelect: (value: string) => void;
  active: string;
}

const PuzzleHistory = ({ histories, onSelect, active }: PuzzleHistoryProps) => {
  return (
    <ScrollArea className="whitespace-nowrap">
      <ScrollBar orientation="horizontal" />
      <div className="flex w-max gap-4 px-4 py-2">
        {histories.map((history) => {
          const isCurrent = history.value === active;
          return match(history.completion)
            .with("correct", () => (
              <div key={history.value}>
                <div
                  onClick={() => onSelect(history.value)}
                  className={cn(
                    "flex items-center justify-center size-7 rounded-md bg-[#203427]  border-[#008000] cursor-pointer hover:bg-opacity-80",
                    isCurrent && "border"
                  )}
                >
                  <IconCheck color="green" />
                </div>
                <div className="w-full text-green-300 text-xs text-center">
                  {history.label}
                </div>
              </div>
            ))
            .when(
              (v) => v === "incorrect-complete" || v === "incorrect-incomplete",
              () => (
                <div key={history.value}>
                  <div
                    onClick={() => onSelect(history.value)}
                    className={cn(
                      "flex items-center justify-center size-7 rounded-md bg-[#3B2326]  border-[#FF0000] cursor-pointer hover:bg-opacity-80",
                      isCurrent && "border"
                    )}
                  >
                    <IconX color="red" />
                  </div>
                  <div className="w-full text-red-300 text-xs text-center">
                    {history.label}
                  </div>
                </div>
              )
            )
            .with("incomplete", () => (
              <div key={history.value} className="flex flex-col items-center">
                <div
                  onClick={() => onSelect(history.value)}
                  className={cn(
                    "flex items-center justify-center size-7 rounded-md bg-[#3B311B]  border-[#FFFF00] cursor-pointer hover:bg-opacity-80",
                    isCurrent && "border-2"
                  )}
                >
                  <IconDots color="yellow" />
                </div>
                <div className="w-full text-yellow-300 text-xs text-center">
                  {history.label}
                </div>
              </div>
            ))
            .exhaustive();
        })}
      </div>
    </ScrollArea>
  );
};

export default PuzzleHistory;
