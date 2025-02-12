import { type StateCreator, createStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { produce } from "immer";
import { isNormal, Move } from "chessops";
import { INITIAL_FEN, makeFen } from "chessops/fen";
import { makeSan, parseSan } from "chessops/san";
import { DrawShape } from "chessground/draw";

import { playSound } from "@/utils/sound";
import { parseSanOrUci, positionFromFen } from "@/utils/chessops";
import {
  createNode,
  defaultTree,
  GameHeaders,
  getNodeAtPath,
  treeIteratorMainLine,
  TreeNode,
  TreeState,
} from "@/utils/tree-reducer";
import { isPrefix } from "@/utils/misc";

interface ChessStoreState {
  root: TreeNode;
  headers: GameHeaders;
  position: number[];
  dirty: boolean;

  currentNode: () => TreeNode;

  goToNext: () => void;
  goToPrevious: () => void;
  goToStart: () => void;
  goToEnd: () => void;
  goToMove: (move: number[]) => void;
  goToBranchStart: () => void;
  goToBranchEnd: () => void;
  nextBranch: () => void;
  previousBranch: () => void;
  nextBranching: () => void;
  previousBranching: () => void;

  makeMove: (args: {
    payload: string | Move;
    changePosition?: boolean;
    mainline?: boolean;
    clock?: number;
    changeHeaders?: boolean;
  }) => void;

  appendMove: (args: { payload: Move; clock?: number }) => void;

  makeMoves: (args: {
    payload: string[];
    mainline?: boolean;
    changeHeaders?: boolean;
  }) => void;
  deleteMove: (path?: number[]) => void;
  promoteVariation: (path: number[]) => void;
  promoteToMainline: (path: number[]) => void;

  setStart: (start: number[]) => void;

  setHeaders: (payload: GameHeaders) => void;
  setShapes: (shapes: DrawShape[]) => void;

  clearShapes: () => void;

  setFen: (fen: string) => void;

  setState: (state: TreeState) => void;
  reset: () => void;
  save: () => void;
}

export type ChessStore = ReturnType<typeof createChessStore>;

export const createChessStore = (id?: string, initialTree?: TreeState) => {
  const stateCreator: StateCreator<ChessStoreState> = (set, get) => ({
    ...(initialTree ?? defaultTree()),

    currentNode: () => getNodeAtPath(get().root, get().position),

    setState: (state) => {
      set(() => state);
    },

    reset: () =>
      set(() => {
        return defaultTree();
      }),

    save: () => {
      set((state) => ({
        ...state,
        dirty: false,
      }));
    },

    setFen: (fen) =>
      set(
        produce((state) => {
          state.dirty = true;
          state.root = defaultTree(fen).root;
          state.position = [];
        })
      ),

    goToNext: () =>
      set((state) => {
        const node = getNodeAtPath(state.root, state.position);
        const [pos] = positionFromFen(node.fen);
        if (!pos || !node.children[0]?.move) return state;
        const san = makeSan(pos, node.children[0].move);
        playSound(san.includes("x"), san.includes("+"));
        if (node && node.children.length > 0) {
          return {
            ...state,
            position: [...state.position, 0],
          };
        }
        return state;
      }),

    goToPrevious: () =>
      set((state) => ({ ...state, position: state.position.slice(0, -1) })),

    makeMove: ({
      payload,
      changePosition,
      mainline,
      clock,
      changeHeaders = true,
    }) => {
      set(
        produce((state) => {
          if (typeof payload === "string") {
            const node = getNodeAtPath(state.root, state.position);
            if (!node) return;
            const [pos] = positionFromFen(node.fen);
            if (!pos) return;
            const move = parseSan(pos, payload);
            if (!move) return;
            payload = move;
          }
          makeMove({
            state,
            move: payload,
            last: false,
            changePosition,
            changeHeaders,
            mainline,
            clock,
          });
        })
      );
    },

    // mainline에 추가
    appendMove: ({ payload, clock }) =>
      set(
        produce((state) => {
          makeMove({ state, move: payload, last: true, clock });
        })
      ),

    makeMoves: ({ payload, mainline, changeHeaders = true }) =>
      set(
        produce((state) => {
          state.dirty = true;
          const node = getNodeAtPath(state.root, state.position);
          const [pos] = positionFromFen(node.fen);
          if (!pos) return;
          for (const [i, move] of payload.entries()) {
            const m = parseSanOrUci(pos, move);
            if (!m) return;
            pos.play(m);
            makeMove({
              state,
              move: m,
              last: false,
              mainline,
              sound: i === payload.length - 1,
              changeHeaders,
            });
          }
        })
      ),

    // mainline 끝으로 이동
    goToEnd: () =>
      set(
        produce((state) => {
          const endPosition: number[] = [];
          let currentNode = state.root;
          while (currentNode.children.length > 0) {
            endPosition.push(0);
            currentNode = currentNode.children[0];
          }
          state.position = endPosition;
        })
      ),
    goToStart: () =>
      set((state) => ({
        ...state,
        position: state.headers.start || [],
      })),
    goToMove: (move) =>
      set((state) => ({
        ...state,
        position: move,
      })),
    //변화도 시작점으로 이동
    goToBranchStart: () => {
      set(
        produce((state) => {
          if (
            state.position.length > 0 &&
            state.position[state.position.length - 1] !== 0
          ) {
            state.position = state.position.slice(0, -1);
          }

          while (
            state.position.length > 0 &&
            state.position[state.position.length - 1] === 0
          ) {
            state.position = state.position.slice(0, -1);
          }
        })
      );
    },
    goToBranchEnd: () => {
      set(
        produce((state) => {
          let currentNode = getNodeAtPath(state.root, state.position);
          while (currentNode.children.length > 0) {
            state.position.push(0);
            currentNode = currentNode.children[0];
          }
        })
      );
    },
    nextBranch: () =>
      set(
        produce((state) => {
          if (state.position.length === 0) return;

          const parent = getNodeAtPath(state.root, state.position.slice(0, -1));
          const branchIndex = state.position[state.position.length - 1];
          const node = parent.children[branchIndex];

          // Makes the navigation more fluid and compatible with next/previous branching
          if (node.children.length >= 2 && parent.children.length <= 1) {
            state.position.push(0);
          }

          state.position = [
            ...state.position.slice(0, -1),
            (branchIndex + 1) % parent.children.length,
          ];
        })
      ),
    previousBranch: () =>
      set(
        produce((state) => {
          if (state.position.length === 0) return;

          const parent = getNodeAtPath(state.root, state.position.slice(0, -1));
          const branchIndex = state.position[state.position.length - 1];
          const node = parent.children[branchIndex];

          // Makes the navigation more fluid and compatible with next/previous branching
          if (node.children.length >= 2 && parent.children.length <= 1) {
            state.position.push(0);
          }

          state.position = [
            ...state.position.slice(0, -1),
            (branchIndex + parent.children.length - 1) % parent.children.length,
          ];
        })
      ),
    nextBranching: () =>
      set(
        produce((state) => {
          let node = getNodeAtPath(state.root, state.position);
          let branchCount = node.children.length;

          if (branchCount === 0) return;

          do {
            state.position.push(0);
            node = node.children[0];
            branchCount = node.children.length;
          } while (branchCount === 1);
        })
      ),
    previousBranching: () =>
      set(
        produce((state) => {
          let node = getNodeAtPath(state.root, state.position);
          let branchCount = node.children.length;

          if (state.position.length === 0) return;

          do {
            state.position = state.position.slice(0, -1);
            node = getNodeAtPath(state.root, state.position);
            branchCount = node.children.length;
          } while (branchCount === 1 && state.position.length > 0);
        })
      ),

    deleteMove: (path) =>
      set(
        produce((state) => {
          state.dirty = true;
          deleteMove(state, path ?? state.position);
        })
      ),

    promoteVariation: (path) =>
      set(
        produce((state) => {
          state.dirty = true;
          promoteVariation(state, path);
        })
      ),
    promoteToMainline: (path) =>
      set(
        produce((state) => {
          state.dirty = true;
          while (!promoteVariation(state, path)) {}
        })
      ),

    setStart: (start) =>
      set(
        produce((state) => {
          state.dirty = true;
          state.headers.start = start;
        })
      ),
    setHeaders: (headers) =>
      set(
        produce((state) => {
          state.dirty = true;
          state.headers = headers;
          if (headers.fen && headers.fen !== state.root.fen) {
            state.root = defaultTree(headers.fen).root;
            state.position = [];
          }
        })
      ),

    setShapes: (shapes) =>
      set(
        produce((state) => {
          state.dirty = true;
          setShapes(state, shapes);
        })
      ),
    clearShapes: () =>
      set(
        produce((state) => {
          const node = getNodeAtPath(state.root, state.position);
          if (node && node.shapes.length > 0) {
            state.dirty = true;
            node.shapes = [];
          }
        })
      ),
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

function setShapes(state: TreeState, shapes: DrawShape[]) {
  const node = getNodeAtPath(state.root, state.position);
  if (!node) return state; // 현재 위치의 노드를 찾을 수 없으면 그대로 반환

  const [shape] = shapes; // 전달된 shapes 배열의 첫 번째 요소 가져오기
  if (shape) {
    const index = node.shapes.findIndex(
      (s) => s.orig === shape.orig && s.dest === shape.dest
    );

    if (index !== -1) {
      node.shapes.splice(index, 1); // 동일한 shape가 이미 있으면 제거
    } else {
      node.shapes.push(shape); // 없으면 추가
    }
  } else {
    node.shapes = []; // shapes 배열이 비어 있으면 기존 주석 제거
  }

  return state;
}

function isThreeFoldRepetition(state: TreeState, fen: string) {
  let node = state.root;
  const fens = [INITIAL_FEN.split(" - ")[0]];
  for (const i of state.position) {
    node = node.children[i];
    fens.push(node.fen.split(" - ")[0]);
  }
  return fens.filter((f) => f === fen.split(" - ")[0]).length >= 2;
}

function is50MoveRule(state: TreeState) {
  let node = state.root;
  let count = 0;
  for (const i of state.position) {
    count += 1;
    const [pos] = positionFromFen(node.fen);
    if (!pos) return false;
    if (
      node.move &&
      isNormal(node.move) &&
      (node.move.promotion ||
        node.san?.includes("x") ||
        pos.board.get(node.move.from)?.role === "pawn")
    ) {
      count = 0;
    }
    node = node.children[i];
  }
  return count >= 100;
}

function promoteVariation(state: TreeState, path: number[]) {
  // get last element different from 0
  const i = path.findLastIndex((v) => v !== 0);
  if (i === -1) return state;

  const v = path[i];
  const promotablePath = path.slice(0, i);
  const node = getNodeAtPath(state.root, promotablePath);
  if (!node) return state;
  node.children.unshift(node.children.splice(v, 1)[0]);
  state.position = path;
  state.position[i] = 0;
}

function deleteMove(state: TreeState, path: number[]) {
  //삭제할 노드
  const node = getNodeAtPath(state.root, path);
  if (!node) return;
  //부모 노드
  const parent = getNodeAtPath(state.root, path.slice(0, -1));
  if (!parent) return;
  const index = parent.children.findIndex((n) => n === node);
  //부모 노드에서 해당 노드 제거
  parent.children.splice(index, 1);
  if (isPrefix(path, state.position)) {
    //삭제 노드가 현 위치이면 한 단계 위로 조정
    state.position = path.slice(0, -1);
  } else if (isPrefix(path.slice(0, -1), state.position)) {
    //현재 위치를 첫 번째 자식으로 조정
    if (state.position.length >= path.length) {
      state.position[path.length - 1] = 0;
    }
  }
}

function makeMove({
  state,
  move,
  last,
  changePosition = true,
  changeHeaders = true,
  mainline = false,
  clock,
  sound = true,
}: {
  state: TreeState;
  move: Move;
  last: boolean;
  changePosition?: boolean;
  changeHeaders?: boolean;
  mainline?: boolean;
  clock?: number;
  sound?: boolean;
}) {
  // 현재 적용할 노드를 찾기
  const mainLine = Array.from(treeIteratorMainLine(state.root));
  const position = last
    ? mainLine[mainLine.length - 1].position
    : state.position;
  const moveNode = getNodeAtPath(state.root, position);
  if (!moveNode) return;
  // FEN을 기반으로 체스 포지션 객체 생성
  const [pos] = positionFromFen(moveNode.fen);
  if (!pos) return;

  //이동을 SAN(알기 쉬운 체스 기보 표기법)으로 변환
  const san = makeSan(pos, move);
  if (san === "--") return; // invalid move
  pos.play(move);
  if (sound) {
    playSound(san.includes("x"), san.includes("+"));
  }

  //게임 종료 조건 확인
  if (changeHeaders && pos.isEnd()) {
    if (pos.isCheckmate()) {
      state.headers.result = pos.turn === "white" ? "0-1" : "1-0";
    }
    if (pos.isStalemate() || pos.isInsufficientMaterial()) {
      state.headers.result = "1/2-1/2";
    }
  }

  const newFen = makeFen(pos.toSetup());

  if (
    (changeHeaders && isThreeFoldRepetition(state, newFen)) ||
    is50MoveRule(state)
  ) {
    state.headers.result = "1/2-1/2";
  }

  //변화도에서 동일한 수가 있는지 확인
  const i = moveNode.children.findIndex((n) => n.san === san);
  if (i !== -1) {
    //있다면 해당 위치로 state.position을 이동.
    if (changePosition) {
      if (state.position === position) {
        state.position.push(i);
      } else {
        state.position = [...position, i];
      }
    }
  } else {
    //새로운 노드 추가
    state.dirty = true;
    const newMoveNode = createNode({
      fen: newFen,
      move,
      san,
      halfMoves: moveNode.halfMoves + 1,
      clock,
    });
    if (mainline) {
      //mainline인 경우에는 제일 앞에 추가
      moveNode.children.unshift(newMoveNode);
    } else {
      moveNode.children.push(newMoveNode);
    }
    if (changePosition) {
      if (state.position === position) {
        if (mainline) {
          state.position.push(0);
        } else {
          state.position.push(moveNode.children.length - 1);
        }
      } else {
        state.position = [...position, moveNode.children.length - 1];
      }
    }
  }
}
