export type Completion = "correct" | "incorrect" | "incomplete";

export interface Puzzle {
  fen: string;
  moves: string[];
  rating: number;
  completion: Completion;
}
