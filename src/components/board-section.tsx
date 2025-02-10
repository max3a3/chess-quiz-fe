import { useContext, useMemo } from "react";
import { useStore } from "zustand";

import { getValidMoves } from "@/utils/chessops";
import ChessBoard from "@/components/chess-board";
import ChessDashboard from "@/components/chess-dashboard";
import { ChessStateContext } from "@/provider/chess-state-context";
import { Chess } from "chess.js";

const BoardSection = () => {
  const store = useContext(ChessStateContext)!;

  const fen = useStore(store, (s) => s.fen);
  const game = new Chess(fen);
  const moveIndex = useStore(store, (s) => s.moveIndex);
  const history = useStore(store, (s) => s.history);

  const makeMove = useStore(store, (s) => s.makeMove);

  const turnColor: "white" | "black" =
    game.turn() === "w" ? ("white" as const) : ("black" as const);
  const dests = useMemo(() => getValidMoves(game), [game]);
  const isLastMove = moveIndex === history.length - 1;

  return (
    <section className="flex gap-4 p-2">
      <ChessBoard
        fen={fen}
        animation={{ enabled: true }}
        draggable={{ enabled: true }}
        drawable={{ enabled: true, visible: true }}
        check={game.isCheck() && turnColor}
        movable={{
          free: false,
          // TODO: color를 동적으로 설정시 black turn일 때 이동을 할 수 없는 문제가 있음.
          color: "both",
          dests,
          showDests: true,
          events: {
            after: (orig, dest) => makeMove({ orig, dest }),
          },
        }}
        premovable={{
          enabled: false,
        }}
        coordinates={false}
      />
      <ChessDashboard />
    </section>
  );
};

export default BoardSection;
