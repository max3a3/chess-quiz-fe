export type Outcome = "1-0" | "0-1" | "1/2-1/2" | "*";
export type Score = {
  value: ScoreValue;
  /**
   * The probability of each result (win, draw, loss).
   */
  wdl: [number, number, number] | null;
};
export type ScoreValue =
  /**
   * The score in centipawns.
   */
  | { type: "cp"; value: number }
  /**
   * Mate coming up in this many moves. Negative value means the engine is getting mated.
   */
  | { type: "mate"; value: number };
