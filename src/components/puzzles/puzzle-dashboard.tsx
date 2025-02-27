import { useContext, useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { PlusIcon, XIcon } from "lucide-react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import ActionTooltip from "@/components/ui/action-tooltip";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  enginesAtom,
  jumpToNextPuzzleAtom,
  selectedEngineAtom,
} from "@/state/atoms";
import BestMoves from "@/components/analysis/best-moves";
import { ChessStateContext } from "@/provider/chess-state-context";
import { getVariationLine } from "@/utils/chessops";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PuzzleDashBoardProps {
  turnToMove?: "white" | "black";
  generatePuzzle: () => void;
  clearSession: () => void;
}

const PuzzleDashBoard = ({
  turnToMove,
  generatePuzzle,
  clearSession,
}: PuzzleDashBoardProps) => {
  const store = useContext(ChessStateContext)!;
  const [jumpToNextPuzzleImmediately, setJumpToNextPuzzleImmediately] =
    useAtom(jumpToNextPuzzleAtom);
  const [selectedEngine, setSelectedEngine] = useAtom(selectedEngineAtom);
  const [engines] = useAtom(enginesAtom);
  const rootFen = useStore(store, (s) => s.root.fen);
  const headers = useStore(store, (s) => s.headers);
  const is960 = useMemo(() => headers.variant === "Chess960", [headers]);
  const moves = useStore(
    store,
    useShallow((s) => getVariationLine(s.root, s.position, is960))
  );
  const currentNodeHalfMoves = useStore(
    store,
    useShallow((s) => s.currentNode().halfMoves)
  );

  useEffect(() => {
    if (selectedEngine) return;
    setSelectedEngine(engines[0]);
  }, [selectedEngine, engines]);

  return (
    <div className="flex flex-col space-y-3 h-full">
      <div className="flex justify-between items-center">
        {turnToMove && (
          <h4 className="font-semibold text-2xl text-muted">
            {turnToMove === "white" ? "Black " : "White "}
            To Move
          </h4>
        )}
        <div className="flex items-center gap-1">
          <div className="flex items-center space-x-2">
            <Switch
              checked={jumpToNextPuzzleImmediately}
              onCheckedChange={(checked) =>
                setJumpToNextPuzzleImmediately(checked)
              }
              id="jump-to-next-puzzle-immediately"
              className="data-[state=checked]:bg-slate-700"
            />
            <Label
              htmlFor="jump-to-next-puzzle-immediately"
              className="text-muted"
            >
              Jump to next puzzle immediately
            </Label>
          </div>
          <ActionTooltip label="New Puzzle">
            <Button variant="default" onClick={generatePuzzle} size="icon">
              <PlusIcon className="text-muted" />
            </Button>
          </ActionTooltip>
          <ActionTooltip label="Clear Session">
            <Button variant="default" onClick={clearSession} size="icon">
              <XIcon className="text-muted" />
            </Button>
          </ActionTooltip>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea
          className="h-full"
          onScroll={() =>
            document.dispatchEvent(new Event("analysis-panel-scroll"))
          }
        >
          {selectedEngine && (
            <BestMoves
              engine={selectedEngine}
              fen={rootFen}
              moves={moves}
              halfMoves={currentNodeHalfMoves}
              //임시로 black
              orientation={headers.orientation || "black"}
            />
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default PuzzleDashBoard;
