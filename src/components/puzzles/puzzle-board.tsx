import { useContext } from "react";
import { useStore } from "zustand";
import { useForceUpdate } from "@toss/react";
import { Chess, makeUci, Move, NormalMove, parseSquare } from "chessops";
import { parseFen } from "chessops/fen";
import { chessgroundDests, chessgroundMove } from "chessops/compat";
import equal from "fast-deep-equal";
import { useAtom } from "jotai/react";

import ChessBoard from "@/components/chess-board";
import { ChessStateContext } from "@/provider/chess-state-context";
import { Completion, Puzzle } from "@/utils/puzzles";
import { getNodeAtPath, treeIteratorMainLine } from "@/utils/tree-reducer";
import { positionFromFen } from "@/utils/chessops";
import { jumpToNextPuzzleAtom } from "@/state/atoms";

interface PuzzleBoardProps {
  puzzles: Puzzle[];
  currentPuzzle: number;
  changeCompletion: (completion: Completion) => void;
  generatePuzzle: () => void;
}

const PuzzleBoard = ({
  puzzles,
  currentPuzzle,
  changeCompletion,
  generatePuzzle,
}: PuzzleBoardProps) => {
  const store = useContext(ChessStateContext)!;
  const root = useStore(store, (s) => s.root);
  const position = useStore(store, (s) => s.position);
  const makeMove = useStore(store, (s) => s.makeMove);
  const makeMoves = useStore(store, (s) => s.makeMoves);
  const reset = useForceUpdate();
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
  const dests = pos ? chessgroundDests(pos) : new Map();
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
        if (puzzle.completion !== "incorrect") {
          changeCompletion("correct");
        }

        //퍼즐 즉시 생성 유무
        if (jumpToNextPuzzleImmediately) {
          generatePuzzle();
        }
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
      changeCompletion("incorrect");
    }
    reset();
  }

  function practiceMove(move: Move) {
    makeMove({
      payload: move,
      changeHeaders: false,
    });
  }

  const isEnded = puzzle ? currentMove >= puzzle.moves.length : false;

  return (
    <div>
      <ChessBoard
        animation={{ enabled: true }}
        coordinates={false}
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
              isEnded ? practiceMove(move) : checkMove(move);
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
      />
    </div>
  );
};

export default PuzzleBoard;
