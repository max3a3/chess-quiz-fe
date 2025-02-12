import { useContext } from "react";
import { useStore } from "zustand";

import MoveCell from "@/components/move-cell";
import MoveControls from "@/components/move-controls";
import { ChessStateContext } from "@/provider/chess-state-context";

const ChessDashboard = () => {
  const store = useContext(ChessStateContext)!;

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex-1 p-4 border rounded-md">
        <div className="flex flex-wrap overflow-hidden"></div>
      </div>
      <MoveControls />
    </div>
  );
};

export default ChessDashboard;
