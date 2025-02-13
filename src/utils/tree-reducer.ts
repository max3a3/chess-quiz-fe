import { DrawShape } from "chessground/draw";
import { Move } from "chessops";
import { INITIAL_FEN } from "chessops/fen";

import { positionFromFen } from "@/utils/chessops";
import { Outcome } from "@/utils/types";
import { Annotation } from "@/utils/annotation";
import { Score } from "@/utils/score";

export interface TreeState {
  root: TreeNode;
  headers: GameHeaders;
  position: number[];
  dirty: boolean;
}

export interface TreeNode {
  fen: string;
  move: Move | null;
  san: string | null;
  children: TreeNode[];
  depth: number | null;
  halfMoves: number;
  shapes: DrawShape[];
  score: Score | null;
  annotations: Annotation[];
  comment: string;
  clock?: number;
}

export interface ListNode {
  position: number[];
  node: TreeNode;
}

export interface GameHeaders {
  id: number;
  fen: string;
  event: string;
  site: string;
  date?: string | null;
  time?: string | null;
  round?: string | null;
  white: string;
  white_elo?: number | null;
  black: string;
  black_elo?: number | null;
  result: Outcome;
  time_control?: string | null;
  white_time_control?: string | null;
  black_time_control?: string | null;
  eco?: string | null;
  variant?: string | null;
  // Repertoire headers
  start?: number[];
  orientation?: "white" | "black";
}

export function* treeIterator(node: TreeNode): Generator<ListNode> {
  const stack: ListNode[] = [{ position: [], node }];
  while (stack.length > 0) {
    const { position, node } = stack.pop()!;
    yield { position, node };
    for (let i = node.children.length - 1; i >= 0; i--) {
      stack.push({ position: [...position, i], node: node.children[i] });
    }
  }
}

export function findFen(fen: string, node: TreeNode): number[] {
  const iterator = treeIterator(node);
  for (const item of iterator) {
    if (item.node.fen === fen) {
      return item.position;
    }
  }
  return [];
}

export function* treeIteratorMainLine(node: TreeNode): Generator<ListNode> {
  let current: ListNode | undefined = { position: [], node };
  while (current?.node) {
    yield current;
    current = {
      position: [...current.position, 0],
      node: current.node.children[0],
    };
  }
}

export function defaultTree(fen?: string): TreeState {
  const [pos] = positionFromFen(fen ?? INITIAL_FEN);

  return {
    dirty: false,
    position: [],
    root: {
      fen: fen?.trim() ?? INITIAL_FEN,
      move: null,
      san: null,
      children: [],
      depth: null,
      halfMoves: pos?.turn === "black" ? 1 : 0,
      shapes: [],
      score: null,
      annotations: [],
      comment: "",
    },
    headers: {
      id: 0,
      fen: fen ?? INITIAL_FEN,
      black: "",
      white: "",
      result: "*",
      event: "",
      site: "",
    },
  };
}

export function createNode({
  fen,
  move,
  san,
  halfMoves,
  clock,
}: {
  move: Move;
  san: string;
  fen: string;
  halfMoves: number;
  clock?: number;
}): TreeNode {
  return {
    fen,
    move,
    san,
    children: [],
    depth: null,
    halfMoves,
    shapes: [],
    score: null,
    clock: clock ? clock / 1000 : undefined,
    annotations: [],
    comment: "",
  };
}

export const getNodeAtPath = (node: TreeNode, path: number[]): TreeNode => {
  let currentNode = node;
  for (const index of path) {
    if (!currentNode.children || index >= currentNode.children.length) {
      return currentNode;
    }
    currentNode = currentNode.children[index];
  }
  return currentNode;
};
