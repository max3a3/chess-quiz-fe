import { useContext, useState } from "react";
import { useStore } from "zustand";
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
import { useAtom } from "jotai/react";

import ChessBoard from "@/components/chess-board";
import { ChessStateContext } from "@/provider/chess-state-context";
import { Completion, Puzzle, Status } from "@/utils/puzzles";
import { getNodeAtPath, treeIteratorMainLine } from "@/utils/tree-reducer";
import { positionFromFen } from "@/utils/chessops";
import { jumpToNextPuzzleAtom, snapArrowsAtom } from "@/state/atoms";
import PromotionModal from "@/components/common/promotion-modal";

interface PuzzleBoardProps {
  puzzles: Puzzle[];
  currentPuzzle: number;
  changeCompletion: (completion: Completion) => void;
  changeStatus: (status: Status) => void;
  generatePuzzle: () => void;
}

const PuzzleBoard = ({
  puzzles,
  currentPuzzle,
  changeCompletion,
  changeStatus,
  generatePuzzle,
}: PuzzleBoardProps) => {
  const store = useContext(ChessStateContext)!;
  const root = useStore(store, (s) => s.root);
  const position = useStore(store, (s) => s.position);
  const showHint = useStore(store, (s) => s.showHint);
  const makeMove = useStore(store, (s) => s.makeMove);
  const makeMoves = useStore(store, (s) => s.makeMoves);
  const setShapes = useStore(store, (s) => s.setShapes);
  const reset = useForceUpdate();

  const [snapArrows] = useAtom(snapArrowsAtom);
  const [jumpToNextPuzzleImmediately] = useAtom(jumpToNextPuzzleAtom);

  const currentNode = getNodeAtPath(root, position);

  let puzzle: Puzzle | null = null;
  if (puzzles.length > 0) {
    puzzle = puzzles[currentPuzzle];
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
  if (currentNode.shapes.length > 0) {
    shapes = shapes.concat(currentNode.shapes);
  }

  const isEnded = puzzle ? currentMove >= puzzle.moves.length : false;

  //console.log(currentNode, pos);

  return (
    <div
      onMouseDown={() => {
        setShapes([]);
      }}
      className="size-full"
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
  );
};

export default PuzzleBoard;
