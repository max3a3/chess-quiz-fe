import { useCallback, useContext, useState } from "react";
import { useStore } from "zustand";
import { makeSquare, NormalMove, parseSquare, SquareName } from "chessops";
import { chessgroundDests, chessgroundMove } from "chessops/compat";
import { match } from "ts-pattern";

import { positionFromFen } from "@/utils/chessops";
import ChessBoard from "@/components/chess-board";
import ChessDashboard from "@/components/chess-dashboard";
import { ChessStateContext } from "@/provider/chess-state-context";

const BoardSection = () => {
  const store = useContext(ChessStateContext)!;

  const root = useStore(store, (s) => s.root);
  const rootFen = useStore(store, (s) => s.root.fen);
  const position = useStore(store, (s) => s.position);
  const headers = useStore(store, (s) => s.headers);
  const currentNode = useStore(store, (s) => s.currentNode());

  const goToNext = useStore(store, (s) => s.goToNext);
  const goToPrevious = useStore(store, (s) => s.goToPrevious);
  const storeMakeMove = useStore(store, (s) => s.makeMove);
  const setHeaders = useStore(store, (s) => s.setHeaders);
  const deleteMove = useStore(store, (s) => s.deleteMove);
  const clearShapes = useStore(store, (s) => s.clearShapes);
  const setShapes = useStore(store, (s) => s.setShapes);
  const setFen = useStore(store, (s) => s.setFen);

  const [pos, error] = positionFromFen(currentNode.fen);
  let dests: Map<SquareName, SquareName[]> = pos
    ? chessgroundDests(pos)
    : new Map();

  const [pendingMove, setPendingMove] = useState<NormalMove | null>(null);

  const turn = pos?.turn || "white";

  async function makeMove(move: NormalMove) {
    if (!pos) return;
    storeMakeMove({
      payload: move,
    });
    setPendingMove(null);
  }

  const setBoardFen = useCallback(
    (fen: string) => {
      //연습모드일때만
      if (!fen || true) {
        return;
      }
      const newFen = `${fen} ${currentNode.fen.split(" ").slice(1).join(" ")}`;

      if (newFen !== currentNode.fen) {
        setFen(newFen);
      }
    },
    [currentNode, setFen]
  );

  const square = match(currentNode)
    .with({ san: "O-O" }, ({ halfMoves }) =>
      parseSquare(halfMoves % 2 === 1 ? "g1" : "g8")
    )
    .with({ san: "O-O-O" }, ({ halfMoves }) =>
      parseSquare(halfMoves % 2 === 1 ? "c1" : "c8")
    )
    .otherwise((node) => node?.move?.to);

  const lastMove =
    currentNode.move && square !== undefined
      ? [chessgroundMove(currentNode.move)[0], makeSquare(square)!]
      : undefined;

  return (
    <section>
      <div className="flex gap-4 p-2">
        <ChessBoard
          fen={currentNode.fen}
          setBoardFen={setBoardFen}
          animation={{ enabled: true }}
          coordinates={false}
          movable={{
            free: false,
            color: turn,
            dests: currentNode.children.length > 0 ? undefined : dests,
            showDests: true,
            events: {
              after: (orig, dest) => {
                const from = parseSquare(orig)!;
                const to = parseSquare(dest)!;

                if (pos) {
                  if (
                    pos.board.get(from)?.role === "pawn" &&
                    ((dest[1] === "8" && turn === "white") ||
                      (dest[1] === "1" && turn === "black"))
                  ) {
                    setPendingMove({
                      from,
                      to,
                    });
                  } else {
                    makeMove({
                      from,
                      to,
                    });
                  }
                }
              },
            },
          }}
          turnColor={turn}
          check={pos?.isCheck()}
          lastMove={lastMove}
          premovable={{
            enabled: false,
          }}
          draggable={{
            enabled: true,
          }}
          drawable={{
            enabled: true,
            visible: true,
            defaultSnapToValidMove: false,
            onChange: (shapes) => {
              setShapes(shapes);
            },
          }}
        />
        <ChessDashboard />
      </div>
    </section>
  );
};

export default BoardSection;
