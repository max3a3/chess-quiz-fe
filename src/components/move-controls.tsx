import { useHotkeys } from "react-hotkeys-hook";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { useContext } from "react";
import { useStore } from "zustand";

import { ChessStateContext } from "@/provider/chess-state-context";

const MoveControls = () => {
  const store = useContext(ChessStateContext)!;
  const goToStart = useStore(store, (s) => s.goToStart);
  const goToEnd = useStore(store, (s) => s.goToEnd);
  const goToPrevious = useStore(store, (s) => s.goToPrevious);
  const goToNext = useStore(store, (s) => s.goToNext);

  useHotkeys("arrowdown", goToEnd);
  useHotkeys("arrowup", goToStart);
  useHotkeys("arrowleft", goToPrevious);
  useHotkeys("arrowright", goToNext);

  return (
    <div className="flex gap-2">
      <button
        onClick={goToStart}
        className="flex justify-center items-center flex-1 py-1 bg-slate-50 rounded-md border hover:bg-slate-100 focus:outline-none"
      >
        <ChevronsLeftIcon />
      </button>
      <button
        onClick={goToPrevious}
        className="flex justify-center items-center flex-1 py-1 bg-slate-50 rounded-md border hover:bg-slate-100 focus:outline-none"
      >
        <ChevronLeftIcon />
      </button>
      <button
        onClick={goToNext}
        className="flex justify-center items-center flex-1 py-1 bg-slate-50 rounded-md border hover:bg-slate-100 focus:outline-none"
      >
        <ChevronRightIcon />
      </button>
      <button
        onClick={goToEnd}
        className="flex justify-center items-center flex-1 py-1 bg-slate-50 rounded-md border hover:bg-slate-100 focus:outline-none"
      >
        <ChevronsRightIcon />
      </button>
    </div>
  );
};

export default MoveControls;
