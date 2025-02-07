import { useHotkeys } from "react-hotkeys-hook";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

interface MoveControlsProps {
  goToStart: () => void;
  goToEnd: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
}

const MoveControls = (props: MoveControlsProps) => {
  useHotkeys("arrowdown", props.goToEnd);
  useHotkeys("arrowup", props.goToStart);
  useHotkeys("arrowleft", props.goToPrevious);
  useHotkeys("arrowright", props.goToNext);

  return (
    <div className="flex gap-2">
      <button
        onClick={props.goToStart}
        className="flex justify-center items-center flex-1 py-1 bg-slate-50 rounded-md border hover:bg-slate-100 focus:outline-none"
      >
        <ChevronsLeftIcon />
      </button>
      <button
        onClick={props.goToPrevious}
        className="flex justify-center items-center flex-1 py-1 bg-slate-50 rounded-md border hover:bg-slate-100 focus:outline-none"
      >
        <ChevronLeftIcon />
      </button>
      <button
        onClick={props.goToNext}
        className="flex justify-center items-center flex-1 py-1 bg-slate-50 rounded-md border hover:bg-slate-100 focus:outline-none"
      >
        <ChevronRightIcon />
      </button>
      <button
        onClick={props.goToEnd}
        className="flex justify-center items-center flex-1 py-1 bg-slate-50 rounded-md border hover:bg-slate-100 focus:outline-none"
      >
        <ChevronsRightIcon />
      </button>
    </div>
  );
};

export default MoveControls;
