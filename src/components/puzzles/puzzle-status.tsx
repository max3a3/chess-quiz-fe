import { useContext } from "react";
import { useStore } from "zustand";
import { match } from "ts-pattern";
import { IconCheck, IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Status } from "@/utils/puzzles";
import { cn } from "@/lib/utils";
import { ChessStateContext } from "@/provider/chess-state-context";

interface PuzzleStatusProps {
  status: Status;
  turnToMove?: "white" | "black";
  viewSolution: () => void;
  generatePuzzle: () => void;
}

const PuzzleStatus = ({
  status,
  turnToMove,
  viewSolution,
  generatePuzzle,
}: PuzzleStatusProps) => {
  const store = useContext(ChessStateContext)!;
  const showHint = useStore(store, (s) => s.showHint);
  const toggleHint = useStore(store, (s) => s.toggleHint);

  return (
    <div className="h-full p-4 rounded-md bg-primary">
      {match(status)
        .with("notstarted", () => (
          <div className="flex flex-col justify-center h-full gap-6">
            <div>
              <h5 className="font-semibold text-xl text-muted">내 차례</h5>
              <p className="font-medium text-sm text-muted">
                {turnToMove === "white" ? "흑" : "백"}의 최선 수를 찾아보세요.
              </p>
            </div>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className={cn(
                  "w-full font-semibold",
                  showHint && "bg-blue-500 text-muted hover:bg-blue-500"
                )}
                onClick={toggleHint}
              >
                힌트보기
              </Button>
              <Button
                variant="secondary"
                className="w-full font-semibold"
                onClick={viewSolution}
              >
                정답보기
              </Button>
            </div>
          </div>
        ))
        .with("correct", () => (
          <div className="flex flex-col justify-center h-full gap-6">
            <div>
              <IconCheck color="green" size={32} />
              <h5 className="font-semibold text-xl text-muted">
                가장 좋은 수입니다!
              </h5>
              <p className="font-medium text-sm text-muted">계속하세요...</p>
            </div>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className={cn(
                  "w-full font-semibold",
                  showHint && "bg-blue-500 text-muted hover:bg-blue-500"
                )}
                onClick={toggleHint}
              >
                힌트보기
              </Button>
              <Button
                variant="secondary"
                className="w-full font-semibold"
                onClick={viewSolution}
              >
                정답보기
              </Button>
            </div>
          </div>
        ))
        .with("incorrect", () => (
          <div className="flex flex-col justify-center h-full gap-6">
            <div>
              <IconX color="red" size={32} />
              <h5 className="font-semibold text-xl text-muted">
                그 수가 아닙니다!
              </h5>
              <p className="font-medium text-sm text-muted">다른 것 시도하기</p>
            </div>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className={cn(
                  "w-full font-semibold",
                  showHint && "bg-blue-500 text-muted hover:bg-blue-500"
                )}
                onClick={toggleHint}
              >
                힌트보기
              </Button>
              <Button
                variant="secondary"
                className="w-full font-semibold"
                onClick={viewSolution}
              >
                정답보기
              </Button>
            </div>
          </div>
        ))
        .with("correct-complete", () => (
          <div className="flex flex-col justify-center h-full gap-6">
            <h5 className="font-semibold text-xl text-muted">성공!</h5>
            <Button
              variant="secondary"
              className="w-full font-semibold"
              onClick={generatePuzzle}
            >
              연습 계속하기
            </Button>
          </div>
        ))
        .with("incorrect-complete", () => (
          <div className="flex flex-col justify-center h-full gap-6">
            <h5 className="font-semibold text-xl text-muted">퍼즐 완료!</h5>
            <Button
              variant="secondary"
              className="w-full font-semibold"
              onClick={generatePuzzle}
            >
              연습 계속하기
            </Button>
          </div>
        ))
        .exhaustive()}
    </div>
  );
};

export default PuzzleStatus;
