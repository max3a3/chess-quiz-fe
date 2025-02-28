import { useCallback, useContext, useEffect, useState } from "react";
import { useStore } from "zustand";
import { useSessionStorage } from "usehooks-ts";
import { useAtom } from "jotai/react";
import { parseUci } from "chessops";

import { ChessStateContext } from "@/provider/chess-state-context";
import { Completion, Puzzle, Status } from "@/utils/puzzles";
import { activePuzzleAtom } from "@/state/atoms";
import { positionFromFen } from "@/utils/chessops";
import PuzzleBoard from "@/components/puzzles/puzzle-board";
import { getPuzzle } from "@/api/puzzles-api";
import PuzzleHistory from "@/components/puzzles/puzzle-history";
import GameNotation from "@/components/common/game-notation";
import MoveControls from "@/components/common/move-controls";
import PuzzleStatus from "@/components/puzzles/puzzle-status";
import PuzzleDashBoard from "@/components/puzzles/puzzle-dashboard";
import EvalListener from "@/components/common/eval-listener";
import { genID } from "@/lib/utils";

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
    <section className="h-full">
      <EvalListener />
      <div className="flex gap-4 p-2 h-full">
        <div className="relative flex-1">
          <PuzzleBoard
            key={activePuzzle}
            puzzles={puzzles}
            activePuzzle={activePuzzle || ""}
            changeCompletion={changeCompletion}
            changeStatus={changeStatus}
            generatePuzzle={generatePuzzle}
          />
        </div>
        <div className="flex-1 flex flex-col space-y-2 h-full overflow-hidden">
          <div className="flex flex-col space-y-2 h-full overflow-hidden">
            <div className="h-full p-4 bg-primary rounded-md overflow-hidden">
              <PuzzleDashBoard
                quizComplete={
                  currentStatus === "correct-complete" ||
                  currentStatus === "incorrect-complete"
                }
                turnToMove={turnToMove}
                generatePuzzle={generatePuzzle}
                clearSession={clearSession}
              />
            </div>
            <div className="p-4 bg-primary rounded-md">
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
          </div>
          <div className="flex gap-2 h-full overflow-hidden">
            <div className="flex flex-col space-y-2 flex-1">
              <div className="flex-1 overflow-hidden">
                <GameNotation />
              </div>
              <MoveControls readOnly />
            </div>
            <div className="w-1/4">
              <PuzzleStatus
                status={currentStatus}
                turnToMove={turnToMove}
                viewSolution={viewSolution}
                generatePuzzle={generatePuzzle}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Puzzles;
