import { memo, useContext } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useStore } from "zustand";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

import { ChessStateContext } from "@/provider/chess-state-context";

function MoveControls({ readOnly }: { readOnly?: boolean }) {
  const store = useContext(ChessStateContext)!;
  const next = useStore(store, (s) => s.goToNext);
  const previous = useStore(store, (s) => s.goToPrevious);
  const start = useStore(store, (s) => s.goToStart);
  const end = useStore(store, (s) => s.goToEnd);
  const deleteMove = useStore(store, (s) => s.deleteMove);
  const startBranch = useStore(store, (s) => s.goToBranchStart);
  const endBranch = useStore(store, (s) => s.goToBranchEnd);
  const nextBranch = useStore(store, (s) => s.nextBranch);
  const previousBranch = useStore(store, (s) => s.previousBranch);
  const nextBranching = useStore(store, (s) => s.nextBranching);
  const previousBranching = useStore(store, (s) => s.previousBranching);

  useHotkeys("arrowleft", previous);
  useHotkeys("arrowright", next);
  useHotkeys("shift+arrowup", start);
  useHotkeys("shift+down", end);
  useHotkeys("delete", readOnly ? () => {} : () => deleteMove());
  useHotkeys("arrowup", startBranch);
  useHotkeys("arrowdown", endBranch);
  useHotkeys("c", nextBranch);
  useHotkeys("x", previousBranch);
  useHotkeys("shift+arrowright", nextBranching);
  useHotkeys("shift+arrowleft", previousBranching);

  return (
    <div className="flex gap-2">
      <button
        onClick={start}
        className="flex justify-center items-center flex-1 py-1 bg-primary rounded-md hover:bg-primary/90 focus:outline-none"
      >
        <ChevronsLeftIcon className="text-muted" />
      </button>
      <button
        onClick={previous}
        className="flex justify-center items-center flex-1 py-1 bg-primary rounded-md hover:bg-primary/90 focus:outline-none"
      >
        <ChevronLeftIcon className="text-muted" />
      </button>
      <button
        onClick={next}
        className="flex justify-center items-center flex-1 py-1 bg-primary rounded-md hover:bg-primary/90 focus:outline-none"
      >
        <ChevronRightIcon className="text-muted" />
      </button>
      <button
        onClick={end}
        className="flex justify-center items-center flex-1 py-1 bg-primary rounded-md hover:bg-primary/90 focus:outline-none"
      >
        <ChevronsRightIcon className="text-muted" />
      </button>
    </div>
  );
}

export default memo(MoveControls);
