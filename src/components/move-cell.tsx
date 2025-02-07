import { cn } from "@/lib/utils";
import { addPieceSymbol } from "@/utils/annotation";

interface MoveCellProps {
  isSelected: boolean;
  onClick: () => void;
  move: string;
}

const MoveCell = ({ isSelected, onClick, move }: MoveCellProps) => {
  return (
    <div
      className={cn(
        "p-1 rounded-md font-semibold whitespace-nowrap cursor-pointer hover:bg-slate-300/80",
        isSelected && "bg-slate-300"
      )}
      onClick={onClick}
    >
      {addPieceSymbol(move)}
    </div>
  );
};

export default MoveCell;
