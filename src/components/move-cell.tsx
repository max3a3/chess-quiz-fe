import { cn } from "@/lib/utils";
import { addPieceSymbol } from "@/utils/annotation";

interface MoveCellProps {
  isSelected: boolean;
  halfMoves: number;
  onClick: () => void;
  san: string;
}

const MoveCell = ({ isSelected, halfMoves, onClick, san }: MoveCellProps) => {
  const moveNumber = Math.ceil(halfMoves / 2);
  const isWhite = halfMoves % 2 === 1;
  const hasNumber = halfMoves > 0 && isWhite;

  return (
    <div
      className="flex items-center select-none"
      style={{
        marginLeft: hasNumber ? 6 : 0,
      }}
    >
      {hasNumber && `${moveNumber.toString()}${isWhite ? "." : "..."}`}
      <div
        className={cn(
          "p-1 rounded-md font-semibold whitespace-nowrap cursor-pointer hover:bg-slate-300/80",
          isSelected && "bg-slate-300"
        )}
        onClick={onClick}
      >
        {addPieceSymbol(san)}
      </div>
    </div>
  );
};

export default MoveCell;
