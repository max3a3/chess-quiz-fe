import CompleteMoveCell from "@/components/common/complete-move-cell";
import { Button } from "@/components/ui/button";
import { ChessStateContext } from "@/provider/chess-state-context";
import { TreeNode } from "@/utils/tree-reducer";
import equal from "fast-deep-equal";
import { MinusIcon, PlusIcon } from "lucide-react";
import React, { memo, useContext, useRef, useState } from "react";
import { useStore } from "zustand";

const GameNotation = () => {
  const store = useContext(ChessStateContext)!;
  const root = useStore(store, (s) => s.root);
  const headers = useStore(store, (s) => s.headers);

  const targetRef = useRef<HTMLSpanElement>(null);

  return (
    <div className="p-4 bg-primary rounded-md">
      <div>
        <RenderVariationTree
          targetRef={targetRef}
          tree={root}
          depth={0}
          first
          start={headers.start}
          path={[]}
        />
      </div>
      {headers.result && headers.result !== "*" && (
        <h2>
          {headers.result}
          <br />
          <span>
            {headers.result === "1/2-1/2"
              ? "Draw"
              : headers.result === "1-0"
                ? "White wins"
                : "Black wins"}
          </span>
        </h2>
      )}
    </div>
  );
};

const RenderVariationTree = memo(
  function RenderVariationTree({
    tree,
    depth,
    start,
    first,
    targetRef,
    path,
  }: {
    start?: number[];
    tree: TreeNode;
    depth: number;
    first?: boolean;
    targetRef: React.RefObject<HTMLSpanElement | null>;
    path: number[];
  }) {
    const variations = tree.children;
    const variationNodes = variations.slice(1).map((variation) => {
      const newPath = [...path, variations.indexOf(variation)];
      return (
        <React.Fragment key={variation.fen}>
          <CompleteMoveCell
            annotations={variation.annotations}
            targetRef={targetRef}
            halfMoves={variation.halfMoves}
            move={variation.san}
            fen={variation.fen}
            movePath={newPath}
            isStart={equal(newPath, start)}
            first
          />
          <RenderVariationTree
            targetRef={targetRef}
            tree={variation}
            depth={depth + 2}
            first
            start={start}
            path={newPath}
          />
        </React.Fragment>
      );
    });

    const newPath = [...path, 0];
    return (
      <>
        {variations.length > 0 && (
          <CompleteMoveCell
            annotations={variations[0].annotations}
            targetRef={targetRef}
            halfMoves={variations[0].halfMoves}
            move={variations[0].san}
            fen={variations[0].fen}
            movePath={newPath}
            isStart={equal(newPath, start)}
            first={first}
          />
        )}

        <VariationCell moveNodes={variationNodes} />

        {tree.children.length > 0 && (
          <RenderVariationTree
            targetRef={targetRef}
            tree={tree.children[0]}
            depth={depth + 1}
            start={start}
            path={newPath}
          />
        )}
      </>
    );
  },
  (prev, next) => {
    return (
      prev.tree === next.tree &&
      prev.depth === next.depth &&
      prev.first === next.first &&
      equal(prev.path, next.path) &&
      equal(prev.start, next.start)
    );
  }
);

function VariationCell({ moveNodes }: { moveNodes: React.ReactNode[] }) {
  const [expanded, setExpanded] = useState(true);

  if (moveNodes.length === 0) return null;
  return (
    <div className="ml-3 pl-1 border-l-2 border-[#404040]">
      <Button className="size-6" onClick={() => setExpanded((v) => !v)}>
        {expanded ? (
          <MinusIcon className="!size-2" />
        ) : (
          <PlusIcon className="!size-2" />
        )}
      </Button>
      {expanded && moveNodes.map((node, i) => <div key={i}>{node}</div>)}
    </div>
  );
}

export default memo(GameNotation);
