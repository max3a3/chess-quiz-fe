import { useContext } from "react";
import { useStore } from "zustand";

import MoveCell from "@/components/move-cell";
import MoveControls from "@/components/move-controls";
import { ChessStateContext } from "@/provider/chess-state-context";

const ChessDashboard = () => {
  const store = useContext(ChessStateContext)!;
  const nodes = useStore(store, (s) => s.nodes);
  const moveIndex = useStore(store, (s) => s.moveIndex);

  const goToMove = useStore(store, (s) => s.goToMove);

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex-1 p-4 border rounded-md">
        <div className="flex flex-wrap overflow-hidden">
          {nodes
            .slice(1)
            .map(
              (node, index) =>
                node.san && (
                  <MoveCell
                    key={node.fen}
                    isSelected={index === moveIndex - 1}
                    halfMoves={node.halfMoves}
                    onClick={() => goToMove(index + 1)}
                    san={node.san}
                  />
                )
            )}
        </div>
      </div>
      <MoveControls />
    </div>
  );
};

export default ChessDashboard;
