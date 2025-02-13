import type { Score as ScoreT, ScoreValue as ScoreValueT } from "@/utils/types";
import { match } from "ts-pattern";

export type ScoreValue = ScoreValueT | { type: "dtz"; value: number };
export type Score = Omit<ScoreT, "value"> & { value: ScoreValue };

export function formatScore(score: ScoreValue, precision = 2): string {
  let scoreText = match(score.type)
    .with("cp", () => Math.abs(score.value / 100).toFixed(precision))
    .with("mate", () => `M${Math.abs(score.value)}`)
    .with("dtz", () => `DTZ${Math.abs(score.value)}`)
    .exhaustive();
  if (score.type !== "dtz") {
    if (score.value > 0) {
      scoreText = `+${scoreText}`;
    }
    if (score.value < 0) {
      scoreText = `-${scoreText}`;
    }
  }
  return scoreText;
}
