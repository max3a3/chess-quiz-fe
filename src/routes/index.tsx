import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import * as cg from "chessground/types";

import { getValidMoves } from "@/utils/chessops";
import ChessBoard from "@/components/chess-board";
import ChessDashboard from "@/components/chess-dashboard";
import { playSound } from "@/utils/sound";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [game, setGame] = useState<Chess>(new Chess());

  const [moveIndex, setMoveIndex] = useState(-1);
  const [history, setHistory] = useState<{ fen: string; move: string }[]>([]);

  let fen = game.fen();
  let turnColor: "white" | "black" = game.turn() === "w" ? "white" : "black";
  let dests = useMemo(() => getValidMoves(game), [game]);
  let isLastMove = moveIndex === history.length - 1;

  const handleMove = (orig: cg.Key, dest: cg.Key) => {
    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({ from: orig, to: dest, promotion: "q" });
    setGame(gameCopy);
    setHistory((prev) => [
      ...prev,
      {
        fen: move.after,
        move: move.san,
      },
    ]);
    setMoveIndex((prev) => prev + 1);
    playSound(move.san.includes("x"), move.san.includes("+"));
  };

  const goToMove = (index: number) => {
    if (moveIndex === index) return;
    const gameCopy = new Chess(history[index].fen);
    setGame(gameCopy);
    setMoveIndex(index);
  };

  const goToStart = () => {
    setGame(new Chess());
    setMoveIndex(-1);
  };
  const goToPrevious = () => {
    if (moveIndex === -1) return;
    moveIndex === 0
      ? setGame(new Chess())
      : setGame(new Chess(history[moveIndex - 1].fen));
    setMoveIndex((prev) => prev - 1);
  };
  const goToNext = () => {
    if (isLastMove) return;
    setGame(new Chess(history[moveIndex + 1].fen));
    setMoveIndex((prev) => prev + 1);
    const san = history[moveIndex + 1].move;
    playSound(san.includes("x"), san.includes("+"));
  };
  const goToEnd = () => {
    if (isLastMove) return;
    setGame(new Chess(history[history.length - 1].fen));
    setMoveIndex(history.length - 1);
  };

  return (
    <div className="flex gap-4 p-2">
      <ChessBoard
        fen={fen}
        animation={{ enabled: true }}
        draggable={{ enabled: true }}
        drawable={{ enabled: true, visible: true }}
        check={game.isCheck() && turnColor}
        movable={{
          free: false,
          color: isLastMove ? turnColor : undefined,
          dests,
          showDests: true,
        }}
        events={{
          move: handleMove,
        }}
        coordinates={false}
      />
      <ChessDashboard
        history={history}
        moveIndex={moveIndex}
        goToMove={goToMove}
        goToStart={goToStart}
        goToPrevious={goToPrevious}
        goToNext={goToNext}
        goToEnd={goToEnd}
      />
    </div>
  );
}
