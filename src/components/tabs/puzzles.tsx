import { useCallback, useContext, useEffect, useState } from "react";
import { useStore } from "zustand";
import { useSessionStorage } from "usehooks-ts";
import { useAtom } from "jotai/react";
import { parseUci } from "chessops";

import { ChessStateContext } from "@/provider/chess-state-context";
import { Completion, Puzzle, Status } from "@/utils/puzzles";
import { activePuzzleAtom, jumpToNextPuzzleAtom } from "@/state/atoms";
import { positionFromFen } from "@/utils/chessops";
import PuzzleBoard from "@/components/puzzles/puzzle-board";
import { getPuzzle } from "@/api/puzzles-api";
import PuzzleDashBoard from "@/components/puzzles/puzzle-dashboard";
import EvalListener from "@/components/common/eval-listener";
import { genID } from "@/lib/utils";
import PuzzleEngine from "@/components/puzzles/puzzle-engine";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PuzzleHistory from "@/components/puzzles/puzzle-history";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
  const [activePuzzle, setActivePuzzle] = useAtom(activePuzzleAtom);
  const [jumpToNextPuzzleImmediately, setJumpToNextPuzzleImmediately] =
    useAtom(jumpToNextPuzzleAtom);

  let puzzle: Puzzle | null = null;
  if (puzzles.length > 0) {
    puzzle = puzzles.find((puzzle) => puzzle.value === activePuzzle) ?? null;
  }

  const [currentStatus, setCurrentStatus] = useState<Status>("notstarted");

  async function setPuzzle(puzzle: { fen: string; moves: string[] }) {
    setFen(puzzle.fen);
    makeMove({
      payload: parseUci(puzzle.moves[0])!,
      changePosition: false,
      sound: false,
    });
    await new Promise((r) => setTimeout(r, 100));
    makeMove({ payload: parseUci(puzzle.moves[0])! });
  }

  const generatePuzzle = useCallback(() => {
    getPuzzle().then((puzzle) => {
      const newPuzzle: Puzzle = {
        ...puzzle,
        value: genID(),
        moves: puzzle.moves.split(" "),
        completion: "incomplete",
      };
      setPuzzles((puzzles) => {
        return [...puzzles, newPuzzle];
      });
      setActivePuzzle(newPuzzle.value);
      setPuzzle(newPuzzle);
    });
  }, []);

  const clearSession = useCallback(() => {
    setPuzzles([]);
    reset();
  }, []);

  async function viewSolution() {
    const curPuzzle = puzzles.find((puzzle) => puzzle.value === activePuzzle)!;
    if (curPuzzle.completion !== "correct") {
      setCurrentStatus("incorrect-complete");
    }
    if (curPuzzle.completion === "incomplete") {
      changeCompletion("incorrect-complete");
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
      return puzzles.map((puzzle) =>
        puzzle.value === activePuzzle ? { ...puzzle, completion } : puzzle
      );
    });
  }

  function changeStatus(status: Status) {
    setCurrentStatus(status);
  }

  const turnToMove =
    puzzles.find((puzzle) => puzzle.value === activePuzzle) !== undefined
      ? positionFromFen(
          puzzles.find((puzzle) => puzzle.value === activePuzzle)!.fen
        )[0]?.turn
      : undefined;

  useEffect(() => {
    changeStatus("notstarted");
  }, [activePuzzle]);

  useEffect(() => {
    if (!puzzle) return;
    if (puzzle.completion === "incorrect-complete")
      changeStatus("incorrect-complete");
    else if (puzzle.completion === "correct") changeStatus("correct-complete");
  }, [puzzle]);

  useEffect(() => {
    if (puzzles.length === 0) generatePuzzle();
  }, [puzzles]);

  return (
    <section className="grid grid-cols-2 gap-4 h-full">
      <EvalListener />
      <PuzzleBoard
        key={activePuzzle}
        puzzles={puzzles}
        activePuzzle={activePuzzle || ""}
        changeCompletion={changeCompletion}
        changeStatus={changeStatus}
        generatePuzzle={generatePuzzle}
      />
      <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
        <PuzzleDashBoard
          status={currentStatus}
          turnToMove={turnToMove}
          viewSolution={viewSolution}
          generatePuzzle={generatePuzzle}
        />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="bg-main-box rounded-[10px]">
              <PuzzleHistory
                histories={puzzles.map((p) => ({
                  ...p,
                  label: p.rating.toString(),
                }))}
                active={activePuzzle || ""}
                onSelect={(value) => {
                  setActivePuzzle(value);
                  setPuzzle(puzzles.find((puzzle) => puzzle.value === value)!);
                }}
              />
            </div>
            <div className="flex items-center px-6 py-4 bg-main-box rounded-[10px]">
              <span className="inline-block flex-1 text-sm text-white">
                Rating
              </span>
              <span className="inline-block flex-1 text-lg text-white">
                {puzzle?.rating}
              </span>
            </div>
            <PuzzleEngine
              quizComplete={
                currentStatus === "correct-complete" ||
                currentStatus === "incorrect-complete"
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="jump-to-next-puzzle-immediately"
              className="text-white text-sm"
            >
              Jump to next puzzle immediately
            </Label>
            <Switch
              checked={jumpToNextPuzzleImmediately}
              onCheckedChange={(checked) =>
                setJumpToNextPuzzleImmediately(checked)
              }
              id="jump-to-next-puzzle-immediately"
              className="bg-main-box data-[state=checked]:bg-[#559167]"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-white text-sm">Clear session</Label>
            <Button
              size="icon"
              className="size-9 bg-transparent opacity-70 transition-opacity hover:bg-transparent hover:opacity-100"
              onClick={clearSession}
            >
              <Trash2 className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Puzzles;
