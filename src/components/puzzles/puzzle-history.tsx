import { IconCheck, IconDots, IconX } from "@tabler/icons-react";
import { match } from "ts-pattern";

import { cn } from "@/lib/utils";
import { Completion } from "@/utils/puzzles";

type History = {
  completion: Completion;
  label?: string;
};

interface PuzzleHistoryProps {
  histories: History[];
  onSelect: (index: number) => void;
  current: number;
}

const PuzzleHistory = ({
  histories,
  onSelect,
  current,
}: PuzzleHistoryProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      {histories.map((history, index) => {
        const isCurrent = index === current;
        return match(history.completion)
          .with("correct", () => (
            <div key={index}>
              <div
                onClick={() => onSelect(index)}
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
              <div key={index}>
                <div
                  onClick={() => onSelect(index)}
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
            <div key={index} className="flex flex-col items-center">
              <div
                onClick={() => onSelect(index)}
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
  );
};

export default PuzzleHistory;
