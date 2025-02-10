import { type StateCreator, createStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { produce } from "immer";
import { Chess } from "chess.js";
import * as cg from "chessground/types";

import { playSound } from "@/utils/sound";
import { INITIAL_FEN } from "@/lib/utils";

interface ChessStoreState {
  fen: string;
  moveIndex: number;
  history: { fen: string; move: string }[];

  getGameState: () => Chess;

  makeMove: (args: { orig: cg.Key; dest: cg.Key }) => void;
  goToMove: (index: number) => void;
  goToStart: () => void;
  goToEnd: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
}

export type ChessStore = ReturnType<typeof createChessStore>;

export const createChessStore = (id?: string) => {
  const stateCreator: StateCreator<ChessStoreState> = (set, get) => ({
    fen: INITIAL_FEN,
    moveIndex: -1,
    history: [],

    getGameState: () => new Chess(get().fen),

    makeMove: ({ orig, dest }) => {
      const gameCopy = new Chess(get().fen);
      const move = gameCopy.move({ from: orig, to: dest, promotion: "q" });
      set(
        produce((state) => {
          playSound(move.san.includes("x"), move.san.includes("+"));
          state.fen = gameCopy.fen();
          state.history.push({ fen: move.after, move: move.san });
          state.moveIndex++;
        })
      );
    },
    goToMove: (index) => {
      if (get().moveIndex === index) return;
      set(
        produce((state) => {
          state.fen = get().history[index].fen;
          state.moveIndex = index;
        })
      );
    },
    goToStart: () =>
      set(
        produce((state) => {
          state.fen = INITIAL_FEN;
          state.moveIndex = -1;
        })
      ),
    goToEnd: () => {
      const { moveIndex, history } = get();
      if (moveIndex === history.length - 1) return;
      set(
        produce((state) => {
          state.fen = history[history.length - 1].fen;
          state.moveIndex = history.length - 1;
        })
      );
    },
    goToPrevious: () => {
      const moveIndex = get().moveIndex;
      if (moveIndex === -1) return;
      set(
        produce((state) => {
          state.fen =
            moveIndex === 0 ? INITIAL_FEN : get().history[moveIndex - 1].fen;
          state.moveIndex = moveIndex - 1;
        })
      );
    },
    goToNext: () => {
      const { history, moveIndex } = get();
      if (moveIndex === history.length - 1) return;
      set(
        produce((state) => {
          state.fen = history[moveIndex + 1].fen;
          state.moveIndex = moveIndex + 1;
        })
      );
      const san = history[moveIndex + 1].move;
      playSound(san.includes("x"), san.includes("+"));
    },
  });

  if (id) {
    return createStore<ChessStoreState>()(
      persist(stateCreator, {
        name: id,
        storage: createJSONStorage(() => sessionStorage),
      })
    );
  }
  return createStore<ChessStoreState>()(stateCreator);
};
