export type Completion =
  | "correct"
  | "incorrect-complete"
  | "incorrect-incomplete"
  | "incomplete";
export type NodeCompletion = "correct" | "incorrect";
export type Status =
  | "correct"
  | "incorrect"
  | "correct-complete"
  | "incorrect-complete"
  | "notstarted";

export interface Puzzle {
  value: string;
  fen: string;
  moves: string[];
  rating: number;
  completion: Completion;
}
