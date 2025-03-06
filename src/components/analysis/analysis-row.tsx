import { IconChevronDown } from "@tabler/icons-react";
import { useForceUpdate } from "@toss/react";
import type { Key } from "chessground/types";
import { chessgroundMove } from "chessops/compat";
import { makeFen } from "chessops/fen";
import { parseSan } from "chessops/san";
import { useAtom, useAtomValue } from "jotai";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";

import ScoreBubble from "@/components/analysis/score-bubble";
import ChessBoard from "@/components/chess-board";
import MoveCell from "@/components/common/move-cell";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChessStateContext } from "@/provider/chess-state-context";
import { previewBoardOnHoverAtom, scoreTypeFamily } from "@/state/atoms";
import { positionFromFen } from "@/utils/chessops";
import { Score } from "@/utils/types";
import { Portal } from "@/components/ui/portal";

const AnalysisRow = ({
  engine,
  score,
  moves,
  halfMoves,
  threat,
  fen,
  orientation,
}: {
  engine: string;
  score: Score;
  moves: string[];
  halfMoves: number;
  threat: boolean;
  fen: string;
  orientation: "white" | "black";
}) => {
  const [open, setOpen] = useState<boolean>(false);

  if (!open) {
    moves = moves.slice(0, 12);
  }
  const [pos] = positionFromFen(fen);
  const moveInfo = [];
  if (pos) {
    for (const san of moves) {
      const move = parseSan(pos, san);
      if (!move) break;
      pos.play(move);
      const fen = makeFen(pos.toSetup());
      const lastMove = chessgroundMove(move);
      const isCheck = pos.isCheck();
      moveInfo.push({ fen, san, lastMove, isCheck });
    }
  }

  const ref = useRef<HTMLTableRowElement>(null);
  const reset = useForceUpdate();
  useLayoutEffect(() => {
    document.addEventListener("analysis-panel-scroll", reset);
    return () => {
      document.removeEventListener("analysis-panel-scroll", reset);
    };
  }, [reset]);

  useEffect(() => reset(), [open]);

  const [evalDisplay] = useAtom(scoreTypeFamily(engine));

  return (
    <>
      <TableRow className="align-top hover:bg-transparent">
        <TableCell width={70} className="align-baseline p-2">
          <ScoreBubble size="md" score={score} evalDisplay={evalDisplay} />
        </TableCell>
        <TableCell className="align-baseline p-2">
          <div
            className="flex flex-wrap items-center overflow-hidden"
            style={{
              height: open ? "100%" : 32,
            }}
          >
            {moveInfo.map(({ san, fen, lastMove, isCheck }, index) => (
              <BoardPopover
                position={{
                  left: ref.current?.getClientRects()[0]?.left ?? 0,
                  top: ref.current?.getClientRects()[0]?.top ?? 0,
                }}
                key={index}
                san={san}
                index={index}
                moves={moves}
                halfMoves={halfMoves}
                threat={threat}
                fen={fen}
                orientation={orientation}
                lastMove={lastMove}
                isCheck={isCheck}
              />
            ))}
          </div>
        </TableCell>
        <TableCell className="w-2.5 align-baseline p-2">
          <Button
            style={{
              transition: "transform 200ms ease",
              transform: open ? "rotate(180deg)" : "none",
            }}
            onClick={() => setOpen(!open)}
            size="icon"
            className="size-7 bg-transparent hover:bg-transparent"
          >
            <IconChevronDown size={16} />
          </Button>
        </TableCell>
      </TableRow>
      <TableRow ref={ref} />
    </>
  );
};

function BoardPopover({
  san,
  lastMove,
  isCheck,
  index,
  moves,
  halfMoves,
  threat,
  fen,
  orientation,
  position,
}: {
  san: string;
  lastMove: Key[];
  isCheck: boolean;
  index: number;
  moves: string[];
  halfMoves: number;
  threat: boolean;
  fen: string;
  orientation: "white" | "black";
  position: { left: number; top: number };
}) {
  const total_moves = halfMoves + index + 1 + (threat ? 1 : 0);
  const is_white = total_moves % 2 === 1;
  const move_number = Math.ceil(total_moves / 2);
  const store = useContext(ChessStateContext)!;
  const makeMoves = useStore(store, (s) => s.makeMoves);
  const preview = useAtomValue(previewBoardOnHoverAtom);

  const [hovering, setHovering] = useState(false);

  return (
    <>
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="flex items-center h-8 text-sm text-white/70"
      >
        {(index === 0 || is_white) &&
          `${move_number.toString()}${is_white ? "." : "..."}`}
        <MoveCell
          move={san}
          isCurrentVariation={false}
          annotations={[]}
          isStart={false}
          onClick={() => {
            if (!threat) {
              makeMoves({ payload: moves.slice(0, index + 1) });
            }
          }}
          isSubline={true}
          isWhite={is_white}
        />
      </div>
      {preview && hovering && (
        <Portal>
          <div
            style={{
              top: position.top,
              left: position.left,
            }}
            className="absolute w-[200px]"
          >
            <ChessBoard
              fen={fen}
              coordinates={false}
              viewOnly
              orientation={orientation}
              lastMove={lastMove}
              turnColor={is_white ? "black" : "white"}
              check={isCheck}
              drawable={{
                enabled: true,
                visible: true,
                defaultSnapToValidMove: true,
                eraseOnClick: true,
              }}
            />
          </div>
        </Portal>
      )}
    </>
  );
}

export default AnalysisRow;
