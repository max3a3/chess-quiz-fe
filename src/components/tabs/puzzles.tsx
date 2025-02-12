import { useContext } from "react";
import { useStore } from "zustand";
import { useSessionStorage } from "usehooks-ts";
import { useAtom, useSetAtom } from "jotai/react";
import { parseUci } from "chessops";

import { ChessStateContext } from "@/provider/chess-state-context";
import { Completion, Puzzle } from "@/utils/puzzles";
import { activeTabAtom, currentPuzzleAtom, tabsAtom } from "@/state/atoms";
import { positionFromFen } from "@/utils/chessops";
import PuzzleBoard from "@/components/puzzles/puzzle-board";
import { getPuzzle } from "@/api/puzzles-api";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import ActionTooltip from "@/components/ui/action-tooltip";

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

  const wonPuzzles = puzzles.filter(
    (puzzle) => puzzle.completion === "correct"
  );
  const lostPuzzles = puzzles.filter(
    (puzzle) => puzzle.completion === "incorrect"
  );

  function setPuzzle(puzzle: { fen: string; moves: string[] }) {
    setFen(puzzle.fen);
    makeMove({ payload: parseUci(puzzle.moves[0])! });
  }

  function generatePuzzle() {
    getPuzzle().then((puzzle) => {
      const newPuzzle: Puzzle = {
        ...puzzle,
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

  const setTabs = useSetAtom(tabsAtom);
  const setActiveTab = useSetAtom(activeTabAtom);

  const turnToMove =
    puzzles[currentPuzzle] !== undefined
      ? positionFromFen(puzzles[currentPuzzle]?.fen)[0]?.turn
      : null;

  return (
    <section>
      <div className="flex gap-4 p-2">
        <PuzzleBoard
          puzzles={puzzles}
          currentPuzzle={currentPuzzle}
          changeCompletion={changeCompletion}
          generatePuzzle={generatePuzzle}
        />
        <div className="flex gap-2 flex-1">
          <ActionTooltip label="New Puzzle">
            <Button onClick={generatePuzzle} size="icon">
              <PlusIcon />
            </Button>
          </ActionTooltip>
          <Button disabled={puzzles.length === 0} onClick={viewSolution}>
            View Solution
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Puzzles;
