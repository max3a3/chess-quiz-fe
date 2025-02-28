import { squareToCoordinates } from "@/utils/chessops";
import type { Color } from "chessground/types";
import type { NormalMove, Role } from "chessops";
import { memo, RefObject, useRef } from "react";
import { useOnClickOutside } from "usehooks-ts";

import Piece from "@/components/common/piece";
import { cn } from "@/lib/utils";

const PromotionModal = memo(function PromotionModal({
  pendingMove,
  cancelMove,
  confirmMove,
  turn,
  orientation,
}: {
  pendingMove: NormalMove | null;
  cancelMove: () => void;
  confirmMove: (p: Role) => void;
  turn: Color;
  orientation: Color;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(ref as RefObject<HTMLDivElement>, cancelMove);

  if (!pendingMove) {
    return null;
  }

  const { file, rank } = squareToCoordinates(pendingMove.to, orientation);
  const promotionPieces: Role[] = ["queen", "knight", "rook", "bishop"];
  if (
    (turn === "black" && orientation === "white") ||
    (turn === "white" && orientation === "black")
  ) {
    promotionPieces.reverse();
  }

  return (
    <>
      {pendingMove && (
        <>
          <div className="absolute z-50 size-full bg-[rgba(0,0,0,0.5)] rounded-md" />
          <div
            ref={ref}
            className="absolute z-50 w-[12.5%] h-1/2"
            style={{
              left: `${(file - 1) * 12.5}%`,
              top: rank === 1 ? "50%" : "0%",
            }}
          >
            <div className="grid grid-cols-1 h-full">
              {promotionPieces.map((p) => (
                <div
                  key={p}
                  className="group size-full cursor-pointer overflow-hidden"
                  onClick={() => {
                    confirmMove(p);
                  }}
                >
                  <div
                    className={cn(
                      "flex justify-center items-center size-full bg-muted rounded-full transition-transform group-hover:rounded-none group-hover:scale-125"
                    )}
                  >
                    <Piece
                      size="75%"
                      piece={{
                        role: p,
                        color: turn,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
});

export default PromotionModal;
