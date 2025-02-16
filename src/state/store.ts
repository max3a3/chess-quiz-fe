import { type StateCreator, createStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { produce } from "immer";
import { Move } from "chessops";
import { INITIAL_FEN, makeFen } from "chessops/fen";
import { makeSan } from "chessops/san";
import { devtools } from "zustand/middleware";

import { playSound } from "@/utils/sound";
import { positionFromFen } from "@/utils/chessops";

export type Node = {
  fen: string;
  move: Move | null;
  san: string | null;
  halfMoves: number;
};

interface ChessStoreState {
  moveIndex: number;
  nodes: Node[];

  currentNode: () => Node;
  lastIndex: () => boolean;

  makeMove: (args: { move: Move }) => void;
  goToMove: (index: number) => void;
  goToStart: () => void;
  goToEnd: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
}

export type ChessStore = ReturnType<typeof createChessStore>;

export const createChessStore = (id?: string) => {
  const stateCreator: StateCreator<ChessStoreState> = (set, get) => ({
    moveIndex: 0,
    nodes: [{ fen: INITIAL_FEN, move: null, san: null, halfMoves: 0 }],

    currentNode: () => get().nodes[get().moveIndex],
    lastIndex: () => get().nodes.length - 1 === get().moveIndex,

    makeMove: ({ move }) => {
      const { nodes } = get();
      const lastNode = nodes[nodes.length - 1];
      const [pos] = positionFromFen(lastNode.fen);
      if (!pos) return;
      const san = makeSan(pos, move);
      if (san === "--") return; // invalid move
      pos.play(move);
      playSound(san.includes("x"), san.includes("+"));
      const newFen = makeFen(pos.toSetup());
      set(
        produce((state) => {
          state.nodes.push({
            fen: newFen,
            san,
            move,
            halfMoves: lastNode.halfMoves + 1,
          });
          state.moveIndex++;
        })
      );
    },
    goToMove: (index) => {
      if (get().moveIndex === index) return;
      set(
        produce((state) => {
          state.moveIndex = index;
        })
      );
    },
    goToStart: () =>
      set(
        produce((state) => {
          state.moveIndex = 0;
        })
      ),
    goToEnd: () => {
      const { moveIndex, nodes } = get();
      if (moveIndex === nodes.length - 1) return;
      set(
        produce((state) => {
          state.moveIndex = nodes.length - 1;
        })
      );
    },
    goToPrevious: () => {
      const moveIndex = get().moveIndex;
      if (moveIndex === 0) return;
      set(
        produce((state) => {
          state.moveIndex = moveIndex - 1;
        })
      );
    },
    goToNext: () => {
      const { nodes, moveIndex } = get();
      if (moveIndex === nodes.length - 1) return;
      const san = nodes[moveIndex + 1].san;
      if (!san) return;
      playSound(san.includes("x"), san.includes("+"));
     return set(
        produce((state) => {
          state.moveIndex = moveIndex + 1;
        },undefined,"GoToNext")
      );
    },
  });

  if (id) {
    return createStore<ChessStoreState>()(devtools(
      persist(stateCreator, {
        name: id,
        storage: createJSONStorage(() => sessionStorage),
      })
    ));
  }
  return createStore<ChessStoreState>()(stateCreator);
};
