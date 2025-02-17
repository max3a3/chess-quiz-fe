export type Completion = "correct" | "incorrect" | "incomplete";
export type NodeCompletion = "correct" | "incorrect";

export interface Puzzle {
  fen: string;
  moves: string[];
  rating: number;
  completion: Completion;
}
