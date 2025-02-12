import { Puzzle } from "@/utils/puzzles";

export const getPuzzle = async (): Promise<Omit<Puzzle, "completion">> => {
  try {
    const response = await fetch("/data/puzzles.json");
    if (!response.ok) {
      throw new Error("Failed to fetch puzzles");
    }
    const puzzles = await response.json();
    const randomIndex = Math.floor(Math.random() * puzzles.length);
    return puzzles[randomIndex];
  } catch (error) {
    console.error("Error fetching puzzles:", error);
    throw error;
  }
};
