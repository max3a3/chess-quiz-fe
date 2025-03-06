//import { IconChevronUp, IconCopy, IconX } from "@tabler/icons-react";
import equal from "fast-deep-equal";
import { memo, useContext } from "react";
import { useStore } from "zustand";

import { ChessStateContext } from "@/provider/chess-state-context";
import MoveCell from "@/components/common/move-cell";
import { Annotation } from "@/utils/annotation";
import { cn } from "@/lib/utils";
import { NodeCompletion } from "@/utils/puzzles";

function CompleteMoveCell({
  targetRef,
  annotations,
  movePath,
  move,
  isStart,
  halfMoves,
  first,
  isSubline = false,
  completion,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
  annotations: Annotation[];
  halfMoves: number;
  move?: string | null;
  first?: boolean;
  isStart: boolean;
  movePath: number[];
  isSubline?: boolean;
  completion?: NodeCompletion;
}) {
  const store = useContext(ChessStateContext)!;
  const isCurrentVariation = useStore(store, (s) =>
    equal(s.position, movePath)
  );
  const goToMove = useStore(store, (s) => s.goToMove);

  const moveNumber = Math.ceil(halfMoves / 2);
  const isWhite = halfMoves % 2 === 1;
  const hasNumber = isSubline && halfMoves > 0 && (first || isWhite);

  return (
    <div
      ref={isCurrentVariation ? targetRef : undefined}
      className={cn(
        "inline-block h-full text-white/70 text-sm",
        !isSubline && "flex-1"
      )}
    >
      <span className="text-xs text-main-text/70">
        {hasNumber && `${moveNumber.toString()}${isWhite ? "." : "..."}`}
      </span>
      {move && (
        <MoveCell
          move={move}
          annotations={annotations}
          isStart={isStart}
          isCurrentVariation={isCurrentVariation}
          onClick={() => goToMove(movePath)}
          isSubline={isSubline}
          completion={completion}
          isWhite={isWhite}
        />
      )}
    </div>
  );
}

export default memo(CompleteMoveCell, (prev, next) => {
  return (
    prev.move === next.move &&
    equal(prev.annotations, next.annotations) &&
    prev.first === next.first &&
    prev.isStart === next.isStart &&
    equal(prev.movePath, next.movePath) &&
    prev.halfMoves === next.halfMoves &&
    prev.completion === next.completion &&
    prev.isSubline === next.isSubline
  );
});
