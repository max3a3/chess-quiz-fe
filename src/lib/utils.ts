import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function genID() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return S4() + S4();
}

export const INITIAL_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
export const INITIAL_EPD = INITIAL_BOARD_FEN + " w KQkq -";
export const INITIAL_FEN = INITIAL_EPD + " 0 1";
export const EMPTY_BOARD_FEN = "8/8/8/8/8/8/8/8";
export const EMPTY_EPD = EMPTY_BOARD_FEN + " w - -";
export const EMPTY_FEN = EMPTY_EPD + " 0 1";
