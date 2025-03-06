import { cn } from "@/lib/utils";
import { formatScore } from "@/utils/score";
import { Score } from "@/utils/types";

const ScoreBubble = ({
  size,
  score,
  evalDisplay = "cp",
  //setEvalDisplay = () => {},
}: {
  size: "sm" | "md";
  score: Score;
  evalDisplay?: "cp" | "wdl";
  //setEvalDisplay?: (display: "cp" | "wdl") => void;
}) => {
  if (evalDisplay === "wdl") return null;
  return (
    <div
      className={cn(
        "p-1 rounded-sm shadow-md text-center",
        score.value.value >= 0 ? "bg-gray-100" : "bg-black",
        size === "md" ? "w-14 h-7" : "w-12 h-6"
      )}
    >
      <span
        className={cn(
          "font-bold text-center",
          score.value.value >= 0 ? "text-black" : "text-white",
          size === "md" ? "text-sm" : "text-xs"
        )}
      >
        {formatScore(score.value)}
      </span>
    </div>
  );
};

export default ScoreBubble;
