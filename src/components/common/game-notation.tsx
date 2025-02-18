import equal from "fast-deep-equal";
import React, { memo, useContext, useEffect, useRef } from "react";
import { useStore } from "zustand";

import CompleteMoveCell from "@/components/common/complete-move-cell";
import { ChessStateContext } from "@/provider/chess-state-context";
import { TreeNode } from "@/utils/tree-reducer";
import { getMovePairs } from "@/utils/chessops";
import { ScrollArea } from "@/components/ui/scroll-area";

const GameNotation = () => {
  const store = useContext(ChessStateContext)!;
  const root = useStore(store, (s) => s.root);
  const headers = useStore(store, (s) => s.headers);
  const currentPosition = useStore(store, (s) => s.position);

  const movePairs = getMovePairs(root);

  const scrollRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      if (currentPosition.length === 0) {
        scrollRef.current.scrollTo({ top: 0 });
      } else if (targetRef.current) {
        scrollRef.current.scrollTo({ top: targetRef.current.offsetTop - 370 });
      }
    }
  }, [currentPosition]);

  return (
    <ScrollArea
      ref={scrollRef}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
        }
      }}
      className="h-[350px] bg-primary rounded-md"
    >
      {movePairs.map((movePair, i) => (
        <MovePair
          key={i}
          depth={i + 1}
          movePair={movePair}
          path={new Array(i * 2).fill(0)}
          start={headers.start}
          targetRef={targetRef}
        />
      ))}
    </ScrollArea>
  );
};

const makeVariationNodes = (
  variations: TreeNode[],
  getIndex: (node: TreeNode) => number,
  path: number[],
  depth: number,
  targetRef: React.RefObject<HTMLDivElement | null>,
  start?: number[]
) => {
  return variations.map((variation) => {
    const newPath = [...path, getIndex(variation)];

    return (
      <React.Fragment key={variation.fen}>
        <CompleteMoveCell
          targetRef={targetRef}
          annotations={variation.annotations}
          halfMoves={variation.halfMoves}
          move={variation.san}
          movePath={newPath}
          isStart={equal(newPath, start)}
          first
          isSubline
          completion={variation.completion}
        />
        <RenderVariationTree
          targetRef={targetRef}
          tree={variation}
          depth={depth}
          start={start}
          path={newPath}
        />
      </React.Fragment>
    );
  });
};

const MovePair = memo(function MovePair({
  depth,
  movePair,
  path,
  start,
  targetRef,
}: {
  depth: number;
  movePair: [TreeNode, TreeNode | null];
  path: number[];
  start?: number[];
  targetRef: React.RefObject<HTMLDivElement | null>;
}) {
  const whiteVariations = movePair[0].children;
  const whiteVariationNodes = makeVariationNodes(
    whiteVariations.slice(1),
    (variation) => whiteVariations.indexOf(variation),
    [...path, 0],
    depth + 1,
    targetRef,
    start
  );
  const blackVariations = movePair[1]?.children;
  const blackVariationNodes = blackVariations
    ? makeVariationNodes(
        blackVariations.slice(1),
        (variation) => blackVariations.indexOf(variation),
        [...path, 0, 0],
        depth + 1,
        targetRef,
        start
      )
    : [];

  return (
    <div>
      <div className="flex items-center h-10">
        <div className="flex items-center justify-center h-full w-8 bg-neutral-700 border-r text-muted text-center">
          {depth}
        </div>
        {movePair.map((node, i) => {
          if (!node) return <div key={i} className="flex-1" />;
          const newPath = i === 0 ? [...path, 0] : [...path, 0, 0];
          return (
            <CompleteMoveCell
              key={node.fen}
              targetRef={targetRef}
              annotations={node.annotations}
              halfMoves={node.halfMoves}
              move={node.san}
              movePath={newPath}
              isStart={equal(newPath, start)}
              first
              completion={node.completion}
            />
          );
        })}
      </div>
      {(whiteVariationNodes.length > 0 || blackVariationNodes.length > 0) && (
        <div className="py-1 bg-neutral-700 border-t border-b">
          <VariationCell moveNodes={whiteVariationNodes} />
          <VariationCell moveNodes={blackVariationNodes} />
        </div>
      )}
    </div>
  );
});

const RenderVariationTree = memo(
  function RenderVariationTree({
    tree,
    depth,
    start,
    path,
    targetRef,
  }: {
    start?: number[];
    tree: TreeNode;
    depth: number;
    path: number[];
    targetRef: React.RefObject<HTMLDivElement | null>;
  }) {
    const variations = tree.children;
    const variationNodes = makeVariationNodes(
      variations,
      (variation) => variations.indexOf(variation),
      path,
      depth + 1,
      targetRef,
      start
    );

    const newPath = [...path, 0];

    if (variations.length <= 1)
      return (
        variations.length > 0 && (
          <>
            <CompleteMoveCell
              targetRef={targetRef}
              annotations={variations[0].annotations}
              halfMoves={variations[0].halfMoves}
              move={variations[0].san}
              movePath={newPath}
              isStart={equal(newPath, start)}
              isSubline
              completion={variations[0].completion}
            />
            <RenderVariationTree
              tree={variations[0]}
              depth={depth}
              start={start}
              path={newPath}
              targetRef={targetRef}
            />
          </>
        )
      );
    return <VariationCell moveNodes={variationNodes} />;
  },
  (prev, next) => {
    return (
      prev.tree === next.tree &&
      prev.depth === next.depth &&
      equal(prev.path, next.path) &&
      equal(prev.start, next.start)
    );
  }
);

function VariationCell({ moveNodes }: { moveNodes: React.ReactNode[] }) {
  if (moveNodes.length === 0) return null;
  return (
    <div className="pl-2">
      {moveNodes.map((node, i) => (
        <div key={i} className="">
          {node}
        </div>
      ))}
    </div>
  );
}

export default memo(GameNotation);
