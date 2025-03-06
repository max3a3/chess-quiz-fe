import { ActivityIcon } from "lucide-react";

import GameNotation from "@/components/common/game-notation";
import MoveControls from "@/components/common/move-controls";
import PuzzleStatus from "@/components/puzzles/puzzle-status";
import { Status } from "@/utils/puzzles";

interface PuzzleDashBoardProps {
  status: Status;
  turnToMove?: "white" | "black";
  viewSolution: () => void;
  generatePuzzle: () => void;
}

const PuzzleDashBoard = (props: PuzzleDashBoardProps) => {
  return (
    <div className="flex flex-col space-y-8 h-full py-6 bg-main-box rounded-[20px] overflow-hidden">
      <div className="space-y-3 px-7">
        <div className="flex items-start gap-4">
          <div className="w-[52px] text-sm text-white/60 leading-loose">
            from
          </div>
          <div>
            <h4 className="font-semibold text-base text-white">game 10+0</h4>
            <span className="text-sm text-white/60">3.Feb.24</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {["Crushing", "Endgame", "Pin", "Short Puzzle"].map((text) => (
            <div
              key={text}
              className="py-1 px-2 bg-main-button rounded-sm text-sm text-main-text"
            >
              #{text}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-7 flex-1 overflow-hidden">
        <GameNotation />
        <div className="space-y-4 px-7">
          <MoveControls readOnly />
          <button className="flex items-center justify-center gap-2 py-3 w-full bg-main-button rounded-full transition-colors hover:bg-opacity-80">
            <ActivityIcon className="size-4 text-white" />
            <span className="text-sm text-white">Analysis</span>
          </button>
        </div>
      </div>
      <PuzzleStatus {...props} />
    </div>
  );
};

export default PuzzleDashBoard;
