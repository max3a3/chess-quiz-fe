import { useContext, useState } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useForceUpdate } from "@toss/react";
import {
  Chess,
  makeSquare,
  makeUci,
  Move,
  NormalMove,
  parseSquare,
  parseUci,
  SquareName,
} from "chessops";
import { parseFen } from "chessops/fen";
import { chessgroundDests, chessgroundMove } from "chessops/compat";
import { DrawShape } from "chessground/draw";
import equal from "fast-deep-equal";
import { useAtom, useAtomValue } from "jotai/react";

import ChessBoard from "@/components/chess-board";
import { ChessStateContext } from "@/provider/chess-state-context";
import { Completion, Puzzle, Status } from "@/utils/puzzles";
import { getNodeAtPath, treeIteratorMainLine } from "@/utils/tree-reducer";
import { getVariationLine, positionFromFen } from "@/utils/chessops";
import {
  activeTabAtom,
  bestMovesFamily,
  currentEvalOpenAtom,
  jumpToNextPuzzleAtom,
  selectedEngineAtom,
  showArrowsAtom,
  showConsecutiveArrowsAtom,
  snapArrowsAtom,
  tabEngineSettingsFamily,
} from "@/state/atoms";
import PromotionModal from "@/components/common/promotion-modal";
import { match } from "ts-pattern";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "lucide-react";
import EvalBar from "@/components/analysis/eval-bar";

const LARGE_BRUSH = 11;
const MEDIUM_BRUSH = 7.5;
const SMALL_BRUSH = 4;
const arrowColors = [
  { strong: "blue", pale: "paleBlue" },
  { strong: "green", pale: "paleGreen" },
  { strong: "red", pale: "paleRed" },
  { strong: "yellow", pale: "yellow" }, // there's no paleYellow in chessground
];

interface PuzzleBoardProps {
  puzzles: Puzzle[];
  activePuzzle: string;
  changeCompletion: (completion: Completion) => void;
  changeStatus: (status: Status) => void;
  generatePuzzle: () => void;
}

const PuzzleBoard = ({
  puzzles,
  activePuzzle,
  changeCompletion,
  changeStatus,
  generatePuzzle,
}: PuzzleBoardProps) => {
  const store = useContext(ChessStateContext)!;
  const root = useStore(store, (s) => s.root);
  const position = useStore(store, (s) => s.position);
  const moves = useStore(
    store,
    useShallow((s) => getVariationLine(s.root, s.position))
  );
  const showHint = useStore(store, (s) => s.showHint);
  const makeMove = useStore(store, (s) => s.makeMove);
  const makeMoves = useStore(store, (s) => s.makeMoves);
  const setShapes = useStore(store, (s) => s.setShapes);
  const reset = useForceUpdate();

  const activeTab = useAtomValue(activeTabAtom);
  const [evalOpen, setEvalOpen] = useAtom(currentEvalOpenAtom);
  const [snapArrows] = useAtom(snapArrowsAtom);
  const showArrows = useAtomValue(showArrowsAtom);
  const showConsecutiveArrows = useAtomValue(showConsecutiveArrowsAtom);
  const [jumpToNextPuzzleImmediately] = useAtom(jumpToNextPuzzleAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);
  const settings = useAtomValue(
    tabEngineSettingsFamily({
      engineName: selectedEngine?.name ?? "",
      defaultSettings: selectedEngine?.settings ?? undefined,
      defaultGo: selectedEngine?.go ?? undefined,
      tab: activeTab!,
    })
  );

  const currentNode = getNodeAtPath(root, position);

  const arrows = useAtomValue(
    bestMovesFamily({
      fen: root.fen,
      gameMoves: moves,
    })
  );

  let puzzle: Puzzle | null = null;
  if (puzzles.length > 0) {
    puzzle = puzzles.find((puzzle) => puzzle.value === activePuzzle) ?? null;
  }

  const [pos] = positionFromFen(currentNode.fen);

  const treeIter = treeIteratorMainLine(root);
  treeIter.next();
  let currentMove = 0;
  if (puzzle) {
    for (const { node } of treeIter) {
      if (node.move && makeUci(node.move) === puzzle.moves[currentMove]) {
        currentMove++;
      } else {
        break;
      }
    }
  }

  const orientation = puzzle?.fen
    ? Chess.fromSetup(parseFen(puzzle.fen).unwrap()).unwrap().turn === "white"
      ? "black"
      : "white"
    : "white";
  const [pendingMove, setPendingMove] = useState<NormalMove | null>(null);

  const dests: Map<SquareName, SquareName[]> = pos
    ? chessgroundDests(pos)
    : new Map();
  const turn = pos?.turn || "white";

  function checkMove(move: Move) {
    if (!pos) return;
    if (!puzzle) return;

    const newPos = pos.clone();
    const uci = makeUci(move);
    newPos.play(move);

    //퍼즐에서 예상된 이동 === 사용자의 이동 이거나 체크메이트일 경우 올바른 이동으로 판단
    if (puzzle.moves[currentMove] === uci || newPos.isCheckmate()) {
      //퍼즐이 완성된 경우
      if (currentMove === puzzle.moves.length - 1) {
        if (!puzzle.completion.startsWith("incorrect")) {
          changeCompletion("correct");
          changeStatus("correct-complete");
        } else {
          changeCompletion("incorrect-complete");
          changeStatus("incorrect-complete");
        }
        //퍼즐 즉시 생성 유무
        if (jumpToNextPuzzleImmediately) {
          generatePuzzle();
        }
      } else {
        changeStatus("correct");
      }
      //퍼즐의 다음 이동을 가져와 실행
      const newMoves = puzzle.moves.slice(currentMove, currentMove + 2);
      makeMoves({
        payload: newMoves,
        mainline: true,
        changeHeaders: false,
        puzzleMoves: true,
      });
    } else {
      //올바른 이동이 아닐 경우에는 노드 추가는 하되 position 변경은 하지 않음.
      makeMove({
        payload: move,
        changePosition: false,
        changeHeaders: false,
        completion: "incorrect",
      });
      changeCompletion("incorrect-incomplete");
      changeStatus("incorrect");
    }
    reset();
  }

  function practiceMove(move: Move) {
    makeMove({
      payload: move,
      changeHeaders: false,
    });
  }

  function findSelected() {
    if (!puzzle || !pos) return;
    const newMove = puzzle.moves[currentMove];
    const parsedMove = parseUci(newMove) as NormalMove;
    if (!parsedMove) return;
    const from = makeSquare(parsedMove.from);
    return from;
  }

  let selected = showHint ? findSelected() : null;

  let shapes: DrawShape[] = [];
  if (showArrows && evalOpen && arrows.size > 0 && pos && settings.enabled) {
    const entries = Array.from(arrows.entries()).sort((a, b) => a[0] - b[0]);
    for (const [i, moves] of entries) {
      if (i < 4) {
        const bestWinChance = moves[0].winChance;
        for (const [j, { pv, winChance }] of moves.entries()) {
          const posClone = pos.clone();
          let prevSquare = null;
          for (const [ii, uci] of pv.entries()) {
            const m = parseUci(uci)! as NormalMove;

            posClone.play(m);
            const from = makeSquare(m.from)!;
            const to = makeSquare(m.to)!;
            if (prevSquare === null) {
              prevSquare = from;
            }
            const brushSize = match(bestWinChance - winChance)
              .when(
                (d) => d < 2.5,
                () => LARGE_BRUSH
              )
              .when(
                (d) => d < 5,
                () => MEDIUM_BRUSH
              )
              .otherwise(() => SMALL_BRUSH);

            if (
              ii === 0 ||
              (showConsecutiveArrows && j === 0 && ii % 2 === 0)
            ) {
              if (
                ii < 5 && // max 3 arrows
                !shapes.find((s) => s.orig === from && s.dest === to) &&
                prevSquare === from
              ) {
                shapes.push({
                  orig: from,
                  dest: to,
                  brush: j === 0 ? arrowColors[i].strong : arrowColors[i].pale,
                  modifiers: {
                    lineWidth: brushSize,
                  },
                });
                prevSquare = to;
              } else {
                break;
              }
            }
          }
        }
      }
    }
  }
  if (currentNode.shapes.length > 0) {
    shapes = shapes.concat(currentNode.shapes);
  }

  const isEnded = puzzle ? currentMove >= puzzle.moves.length : false;

  return (
    <div className="relative h-fit pl-8">
      <div className="absolute inset-0 w-6">
        {settings.enabled && (
          <>
            {!evalOpen && (
              <div className="size-full">
                <Button size="icon" onClick={() => setEvalOpen(true)}>
                  <ChevronRightIcon />
                </Button>
              </div>
            )}
            {evalOpen && (
              <div onClick={() => setEvalOpen(false)} className="h-full">
                <EvalBar
                  score={currentNode.score?.value || null}
                  orientation={orientation}
                />
              </div>
            )}
          </>
        )}
      </div>
      <div
        onMouseDown={() => {
          setShapes([]);
        }}
        className="flex-1 h-0 pb-[100%] max-w-[770px]"
      >
        <PromotionModal
          pendingMove={pendingMove}
          cancelMove={() => setPendingMove(null)}
          confirmMove={(p) => {
            if (pendingMove) {
              isEnded
                ? practiceMove({ ...pendingMove, promotion: p })
                : checkMove({ ...pendingMove, promotion: p });
              setPendingMove(null);
            }
          }}
          turn={turn}
          orientation={orientation}
        />
        <ChessBoard
          animation={{ enabled: true }}
          orientation={orientation}
          movable={{
            free: false,
            color:
              puzzle && (isEnded || equal(position, Array(currentMove).fill(0)))
                ? turn
                : undefined,
            dests,
            events: {
              after: (orig, dest) => {
                const from = parseSquare(orig)!;
                const to = parseSquare(dest)!;
                const move: NormalMove = { from, to };
                if (
                  pos?.board.get(from)?.role === "pawn" &&
                  ((dest[1] === "8" && turn === "white") ||
                    (dest[1] === "1" && turn === "black"))
                ) {
                  setPendingMove(move);
                } else {
                  isEnded ? practiceMove(move) : checkMove(move);
                }
              },
            },
          }}
          draggable={{
            enabled: true,
          }}
          selectable={{
            enabled: true,
          }}
          lastMove={
            currentNode.move ? chessgroundMove(currentNode.move) : undefined
          }
          turnColor={turn}
          fen={currentNode.fen}
          check={pos?.isCheck()}
          drawable={{
            enabled: true,
            visible: true,
            defaultSnapToValidMove: snapArrows,
            autoShapes: selected
              ? [{ orig: selected, brush: "green" }, ...shapes]
              : shapes,
            onChange: (shapes) => {
              setShapes(shapes);
            },
          }}
          hintSelected={selected}
        />
      </div>
    </div>
  );
};

export default PuzzleBoard;
