import { useContext } from "react";
import { useStore } from "zustand";
import { makeSquare, parseSquare, SquareName } from "chessops";
import { chessgroundDests, chessgroundMove } from "chessops/compat";
import { match } from "ts-pattern";

import { positionFromFen } from "@/utils/chessops";
import ChessBoard from "@/components/chess-board";
import ChessDashboard from "@/components/chess-dashboard";
import { ChessStateContext } from "@/provider/chess-state-context";

const BoardSection = () => {
  const store = useContext(ChessStateContext)!;

  const currentNode = useStore(store, (s) => s.currentNode());
  const lastIndex = useStore(store, (s) => s.lastIndex());

  const makeMove = useStore(store, (s) => s.makeMove);

  const [pos] = positionFromFen(currentNode.fen);
  const turn = pos?.turn || "white";
  const dests: Map<SquareName, SquareName[]> = pos
    ? chessgroundDests(pos)
    : new Map();

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
          fen={currentNode?.fen}
          animation={{ enabled: true }}
          draggable={{ enabled: true }}
          drawable={{ enabled: true, visible: true }}
          check={pos?.isCheck()}
          turnColor={turn}
          lastMove={lastMove}
          movable={{
            free: false,
            color: turn,
            dests: lastIndex ? dests : undefined,
            showDests: true,
            events: {
              after: (orig, dest) => {
                const from = parseSquare(orig)!;
                const to = parseSquare(dest)!;
                makeMove({ move: { from, to } });
              },
            },
          }}
          premovable={{
            enabled: false,
          }}
          coordinates={false}
        />
        <ChessDashboard />
      </div>
    </section>
  );
};

export default BoardSection;
