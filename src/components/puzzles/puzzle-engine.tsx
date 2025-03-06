import { useAtom } from "jotai";
import { useContext, useEffect, useMemo } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import BestMoves from "@/components/analysis/best-moves";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { ChessStateContext } from "@/provider/chess-state-context";
import { enginesAtom, selectedEngineAtom } from "@/state/atoms";
import { getVariationLine } from "@/utils/chessops";

const PuzzleEngine = ({ quizComplete }: { quizComplete: boolean }) => {
  const store = useContext(ChessStateContext)!;
  const [selectedEngine, setSelectedEngine] = useAtom(selectedEngineAtom);
  const [engines] = useAtom(enginesAtom);
  const rootFen = useStore(store, (s) => s.root.fen);
  const headers = useStore(store, (s) => s.headers);
  const is960 = useMemo(() => headers.variant === "Chess960", [headers]);
  const moves = useStore(
    store,
    useShallow((s) => getVariationLine(s.root, s.position, is960))
  );
  const currentNodeHalfMoves = useStore(
    store,
    useShallow((s) => s.currentNode().halfMoves)
  );

  useEffect(() => {
    if (selectedEngine) return;
    setSelectedEngine(engines[0]);
  }, [selectedEngine, engines]);

  if (!quizComplete) return null;
  return (
    <Accordion
      className="bg-main-box rounded-[10px] overflow-hidden"
      type="single"
      collapsible
      defaultValue="item-1"
    >
      <AccordionItem value="item-1" className="border-none">
        {selectedEngine && (
          <BestMoves
            engine={selectedEngine}
            fen={rootFen}
            moves={moves}
            halfMoves={currentNodeHalfMoves}
            //임시로 black
            orientation={headers.orientation || "black"}
          />
        )}
      </AccordionItem>
    </Accordion>
  );
};

export default PuzzleEngine;
