import { useContext, useMemo } from "react";
import { useStore } from "zustand";

import MoveCell from "@/components/move-cell";
import MoveControls from "@/components/move-controls";
import { ChessStateContext } from "@/provider/chess-state-context";

const ChessDashboard = () => {
  const store = useContext(ChessStateContext)!;
  const history = useStore(store, (s) => s.history);
  const moveIndex = useStore(store, (s) => s.moveIndex);

  const goToMove = useStore(store, (s) => s.goToMove);

  const groupedHistory = useMemo(
    () =>
      history.reduce<{ fen: string; move: string }[][]>((acc, item, index) => {
        if (index % 2 === 0) {
          acc.push([item]);
        } else {
          acc[acc.length - 1].push(item);
        }
        return acc;
      }, []),
    [history]
  );

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex-1 p-4 border rounded-md">
        <div className="flex flex-wrap gap-x-2 overflow-hidden">
          {groupedHistory.map((pair, groupIndex) => (
            <div key={groupIndex} className="flex items-center">
              <span className="font-medium text-sm text-gray-800">
                {groupIndex + 1}.
              </span>
              {pair.map((item, pairIndex) => {
                const itemIndex = groupIndex * 2 + pairIndex;
                return (
                  <MoveCell
                    key={item.fen}
                    isSelected={itemIndex === moveIndex}
                    onClick={() => goToMove(itemIndex)}
                    move={item.move}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <MoveControls />
    </div>
  );
};

export default ChessDashboard;
