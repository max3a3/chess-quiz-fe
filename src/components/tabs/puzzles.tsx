import { useContext } from "react";
import { useStore } from "zustand";
import { useSessionStorage } from "usehooks-ts";
import { useAtom } from "jotai/react";
import { parseUci } from "chessops";

import { ChessStateContext } from "@/provider/chess-state-context";
import { Completion, Puzzle } from "@/utils/puzzles";
import { currentPuzzleAtom, jumpToNextPuzzleAtom } from "@/state/atoms";
import { positionFromFen } from "@/utils/chessops";
import PuzzleBoard from "@/components/puzzles/puzzle-board";
import { getPuzzle } from "@/api/puzzles-api";
import { Button } from "@/components/ui/button";
import { PlusIcon, XIcon } from "lucide-react";
import ActionTooltip from "@/components/ui/action-tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PuzzleHistory from "@/components/puzzles/puzzle-history";
import GameNotation from "@/components/common/game-notation";
import MoveControls from "@/components/common/move-controls";

const Puzzles = ({ id }: { id: string }) => {
  const store = useContext(ChessStateContext)!;
  const setFen = useStore(store, (s) => s.setFen);
  const goToStart = useStore(store, (s) => s.goToStart);
  const reset = useStore(store, (s) => s.reset);
  const makeMove = useStore(store, (s) => s.makeMove);
  const [puzzles, setPuzzles] = useSessionStorage<Puzzle[]>(
    `${id}-puzzles`,
    []
  );
  const [currentPuzzle, setCurrentPuzzle] = useAtom(currentPuzzleAtom);
  const [jumpToNextPuzzleImmediately, setJumpToNextPuzzleImmediately] =
    useAtom(jumpToNextPuzzleAtom);

  function setPuzzle(puzzle: { fen: string; moves: string[] }) {
    setFen(puzzle.fen);
    makeMove({ payload: parseUci(puzzle.moves[0])! });
  }

  function generatePuzzle() {
    getPuzzle().then((puzzle) => {
      const newPuzzle: Puzzle = {
        ...puzzle,
        moves: puzzle.moves.split(" "),
        completion: "incomplete",
      };
      setPuzzles((puzzles) => {
        return [...puzzles, newPuzzle];
      });
      setCurrentPuzzle(puzzles.length);
      setPuzzle(newPuzzle);
    });
  }

  async function viewSolution() {
    const curPuzzle = puzzles[currentPuzzle];
    if (curPuzzle.completion === "incomplete") {
      changeCompletion("incorrect");
    }
    goToStart();
    for (let i = 0; i < curPuzzle.moves.length; i++) {
      makeMove({
        payload: parseUci(curPuzzle.moves[i])!,
        mainline: true,
        // Black 퀴즈일 때, White 퀴즈일 때 구분 필요. 지금은 Black
        completion: i % 2 === 1 ? "correct" : undefined,
      });
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  function changeCompletion(completion: Completion) {
    setPuzzles((puzzles) => {
      puzzles[currentPuzzle].completion = completion;
      return [...puzzles];
    });
  }

  const turnToMove =
    puzzles[currentPuzzle] !== undefined
      ? positionFromFen(puzzles[currentPuzzle]?.fen)[0]?.turn
      : null;

  return (
    <section>
      <div className="flex gap-4 p-2">
        <PuzzleBoard
          key={currentPuzzle}
          puzzles={puzzles}
          currentPuzzle={currentPuzzle}
          changeCompletion={changeCompletion}
          generatePuzzle={generatePuzzle}
        />
        <div className="flex flex-col space-y-2 flex-1">
          <div className="space-y-3 p-4 bg-primary rounded-md">
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
                  <Button
                    variant="default"
                    onClick={generatePuzzle}
                    size="icon"
                  >
                    <PlusIcon className="text-muted" />
                  </Button>
                </ActionTooltip>
                <ActionTooltip label="Clear Session">
                  <Button
                    variant="default"
                    onClick={() => {
                      setPuzzles([]);
                      reset();
                    }}
                    size="icon"
                  >
                    <XIcon className="text-muted" />
                  </Button>
                </ActionTooltip>
              </div>
            </div>
            <Button
              variant="secondary"
              disabled={puzzles.length === 0}
              onClick={viewSolution}
            >
              View Solution
            </Button>
          </div>
          <div className="flex flex-col space-y-2 h-full">
            <div className="p-4 bg-primary rounded-md">
              <PuzzleHistory
                histories={puzzles.map((p) => ({
                  ...p,
                  label: p.rating.toString(),
                }))}
                current={currentPuzzle}
                onSelect={(i) => {
                  setCurrentPuzzle(i);
                  setPuzzle(puzzles[i]);
                }}
              />
            </div>
            <div className="flex flex-1">
              <div className="flex flex-col space-y-2 flex-1">
                <div className="flex-1">
                  <GameNotation />
                </div>
                <MoveControls readOnly />
              </div>
              <div className="w-1/4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Puzzles;
