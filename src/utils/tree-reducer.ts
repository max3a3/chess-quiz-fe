import { DrawShape } from "chessground/draw";
import { Move } from "chessops";
import { INITIAL_FEN } from "chessops/fen";

import { positionFromFen } from "@/utils/chessops";
import { Outcome } from "@/utils/types";

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
}

export interface ListNode {
  position: number[];
  node: TreeNode;
}

export interface GameHeaders {
  id: number;
  fen: string;
  result: Outcome;

  start?: number[];
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
    },
    headers: {
      id: 0,
      fen: fen ?? INITIAL_FEN,
      result: "*",
    },
  };
}

export function createNode({
  fen,
  move,
  san,
  halfMoves,
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
