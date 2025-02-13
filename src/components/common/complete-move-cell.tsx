import { currentTabAtom } from "@/state/atoms";
import { IconChevronUp, IconCopy, IconX } from "@tabler/icons-react";
import equal from "fast-deep-equal";
import { useAtomValue } from "jotai";
import { memo, useContext } from "react";
import { useStore } from "zustand";

import { ChessStateContext } from "@/provider/chess-state-context";
import MoveCell from "@/components/common/move-cell";
import { Annotation } from "@/utils/annotation";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function CompleteMoveCell({
  annotations,
  movePath,
  halfMoves,
  move,
  fen,
  first,
  isStart,
  targetRef,
}: {
  annotations: Annotation[];
  halfMoves: number;
  move?: string | null;
  fen?: string;
  first?: boolean;
  isStart: boolean;
  movePath: number[];
  targetRef: React.RefObject<HTMLSpanElement | null>;
}) {
  const store = useContext(ChessStateContext)!;
  const isCurrentVariation = useStore(store, (s) =>
    equal(s.position, movePath)
  );
  const goToMove = useStore(store, (s) => s.goToMove);
  const deleteMove = useStore(store, (s) => s.deleteMove);
  const promoteVariation = useStore(store, (s) => s.promoteVariation);
  const promoteToMainline = useStore(store, (s) => s.promoteToMainline);
  const copyVariationPGN = useStore(store, (s) => s.copyVariationPgn);

  const moveNumber = Math.ceil(halfMoves / 2);
  const isWhite = halfMoves % 2 === 1;
  const hasNumber = halfMoves > 0 && (first || isWhite);

  return (
    <>
      <span
        ref={isCurrentVariation ? targetRef : undefined}
        style={{
          marginLeft: hasNumber ? 6 : 0,
        }}
        className="inline-block text-[80%] text-muted"
      >
        {hasNumber && `${moveNumber.toString()}${isWhite ? "." : "..."}`}
        {move && (
          <ContextMenu>
            <ContextMenuTrigger>
              <MoveCell
                move={move}
                annotations={annotations}
                isStart={isStart}
                isCurrentVariation={isCurrentVariation}
                onClick={() => goToMove(movePath)}
              />
            </ContextMenuTrigger>
            <ContextMenuContent className="w-[200px] bg-neutral-800 border-neutral-600">
              <ContextMenuItem
                onClick={() => promoteToMainline(movePath)}
                className="gap-2 text-muted focus:bg-neutral-700 focus:text-muted"
              >
                <IconChevronUp size="0.875rem" />
                <span>Promote to Main Line</span>
              </ContextMenuItem>

              <ContextMenuItem
                onClick={() => promoteVariation(movePath)}
                className="gap-2 text-muted focus:bg-neutral-700 focus:text-muted"
              >
                <IconChevronUp size="0.875rem" />
                <span>Promote Variation</span>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => copyVariationPGN(movePath)}
                className="gap-2 text-muted focus:bg-neutral-700 focus:text-muted"
              >
                <IconCopy size="0.875rem" />
                <span>Copy Variation PGN</span>
              </ContextMenuItem>
              <ContextMenuItem
                color="red"
                onClick={() => deleteMove(movePath)}
                className="gap-2 text-red-500 focus:bg-neutral-700 focus:text-red-500"
              >
                <IconX size="0.875rem" />
                <span>Delete Move</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </span>
    </>
  );
}

export default memo(CompleteMoveCell, (prev, next) => {
  return (
    prev.move === next.move &&
    prev.fen === next.fen &&
    prev.first === next.first &&
    prev.isStart === next.isStart &&
    equal(prev.annotations, next.annotations) &&
    equal(prev.movePath, next.movePath) &&
    prev.halfMoves === next.halfMoves
  );
});
