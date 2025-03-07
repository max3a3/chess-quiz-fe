import { useContext } from "react";
import { useStore } from "zustand";
import { match } from "ts-pattern";
import { LightbulbIcon } from "lucide-react";

import { Status } from "@/utils/puzzles";
import { cn } from "@/lib/utils";
import { ChessStateContext } from "@/provider/chess-state-context";

interface PuzzleStatusProps {
  status: Status;
  turnToMove?: "white" | "black";
  viewSolution: () => void;
  generatePuzzle: () => void;
}

const PuzzleStatus = ({
  status,
  turnToMove,
  viewSolution,
  generatePuzzle,
}: PuzzleStatusProps) => {
  const store = useContext(ChessStateContext)!;
  const showHint = useStore(store, (s) => s.showHint);
  const toggleHint = useStore(store, (s) => s.toggleHint);

  return (
    <div className="space-y-7 px-7">
      {match(status)
        .with("notstarted", () => (
          <>
            <div className="flex justify-center items-center gap-3 h-8">
              <span
                className={cn(
                  "text-2xl",
                  turnToMove === "white" ? "text-piece-black" : "text-white"
                )}
              >
                ♖
              </span>
              <span className="text-sm text-white">
                {turnToMove === "white" ? "Black " : "White "}turn
              </span>
            </div>
            <div className="flex gap-3">
              <button
                className={cn(
                  "flex items-center justify-center gap-2 py-3 w-full bg-main-button rounded-full transition-colors hover:bg-opacity-80",
                  showHint && "bg-main-container"
                )}
                onClick={toggleHint}
              >
                <LightbulbIcon className="size-4 text-white" />
                <span className="text-sm text-white">Hint</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 py-3 w-full bg-main-button rounded-full transition-colors hover:bg-opacity-80"
                onClick={viewSolution}
              >
                <span className="text-sm text-white">Answer</span>
              </button>
            </div>
          </>
        ))
        .with("correct", () => (
          <>
            <h5 className="h-8 text-sm text-white text-center leading-loose">
              Best move!
            </h5>
            <div className="flex gap-3">
              <button
                className={cn(
                  "flex items-center justify-center gap-2 py-3 w-full bg-main-button rounded-full transition-colors hover:bg-opacity-80",
                  showHint && "bg-main-container"
                )}
                onClick={toggleHint}
              >
                <LightbulbIcon className="size-4 text-white" />
                <span className="text-sm text-white">Hint</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 py-3 w-full bg-main-button rounded-full transition-colors hover:bg-opacity-80"
                onClick={viewSolution}
              >
                <span className="text-sm text-white">Answer</span>
              </button>
            </div>
          </>
        ))
        .with("incorrect", () => (
          <>
            <h5 className="h-8 text-sm text-white text-center leading-loose">
              Incorrect move.
            </h5>
            <div className="flex gap-3">
              <button
                className={cn(
                  "flex items-center justify-center gap-2 py-3 w-full bg-main-button rounded-full transition-colors hover:bg-opacity-80",
                  showHint && "bg-main-container"
                )}
                onClick={toggleHint}
              >
                <LightbulbIcon className="size-4 text-white" />
                <span className="text-sm text-white">Hint</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 py-3 w-full bg-main-button rounded-full transition-colors hover:bg-opacity-80"
                onClick={viewSolution}
              >
                <span className="text-sm text-white">Answer</span>
              </button>
            </div>
          </>
        ))
        .with("correct-complete", () => (
          <>
            <h5 className="h-8 text-sm text-white text-center leading-loose">
              Puzzle Success!
            </h5>
            <button
              className="flex items-center justify-center gap-2 py-3 w-full bg-main-button rounded-full transition-colors hover:bg-opacity-80"
              onClick={generatePuzzle}
            >
              <span className="text-sm text-white">Continue</span>
            </button>
          </>
        ))
        .with("incorrect-complete", () => (
          <>
            <h5 className="h-8 text-sm text-white text-center leading-loose">
              Puzzle Complete!
            </h5>
            <button
              className="flex items-center justify-center gap-2 py-3 w-full bg-main-button rounded-full transition-colors hover:bg-opacity-80"
              onClick={generatePuzzle}
            >
              <span className="text-sm text-white">Continue</span>
            </button>
          </>
        ))
        .exhaustive()}
    </div>
  );
};

export default PuzzleStatus;
