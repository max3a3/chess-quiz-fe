import { Chess } from "chess.js";
import * as cg from "chessground/types";

// 유효한 이동 가능 경로 가져오기
export function getValidMoves(chess: Chess): Map<cg.Key, cg.Key[]> {
  const dests = new Map<cg.Key, cg.Key[]>();
  chess.moves({ verbose: true }).forEach((move) => {
    if (!dests.has(move.from)) {
      dests.set(move.from, []);
    }
    dests.get(move.from)?.push(move.to);
  });
  return dests;
}
