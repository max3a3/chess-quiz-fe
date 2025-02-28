import ActionTooltip from "@/components/ui/action-tooltip";
import { cn } from "@/lib/utils";
import { formatScore, getWinChance } from "@/utils/score";
import { ScoreValue } from "@/utils/types";
import type { Color } from "chessground/types";

function EvalBar({
  score,
  orientation,
}: {
  score: ScoreValue | null;
  orientation: Color;
}) {
  let ScoreBars = null;
  if (score) {
    const progress =
      score.type === "cp"
        ? getWinChance(score.value)
        : score.value > 0
          ? 100
          : 0;

    ScoreBars = [
      <div
        key="black"
        className="flex flex-col bg-gray-800"
        style={{
          height: `${100 - progress}%`,
          transition: "height 0.2s ease",
        }}
      >
        <span
          className={cn(
            "py-[3px] text-xs text-center text-gray-200",
            orientation === "black" && "mt-auto"
          )}
        >
          {score.value <= 0 && formatScore(score, 1).replace(/\+|-/, "")}
        </span>
      </div>,
      <div
        key="white"
        className="flex flex-col bg-gray-200"
        style={{
          height: `${progress}%`,
          transition: "height 0.2s ease",
        }}
      >
        <span
          className={cn(
            "py-[3px] text-xs text-center text-gray-800",
            orientation === "white" && "mt-auto"
          )}
        >
          {score.value > 0 && formatScore(score, 1).slice(1)}
        </span>
      </div>,
    ];
  }

  if (orientation === "black") {
    ScoreBars = ScoreBars?.reverse();
  }
  return (
    <ActionTooltip
      side="right"
      label={score ? formatScore(score) : ""}
      disabled={!score}
      color={score && score.value < 0 ? "dark" : undefined}
    >
      <div className="w-6 h-full rounded-sm overflow-hidden">{ScoreBars}</div>
    </ActionTooltip>
  );
}

export default EvalBar;
