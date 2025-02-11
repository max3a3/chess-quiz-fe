import { Chess, PositionError } from "chessops";
import { FenError, parseFen } from "chessops/fen";

export function positionFromFen(
  fen: string
): [Chess, null] | [null, FenError | PositionError] {
  const [setup, error] = parseFen(fen).unwrap(
    (v) => [v, null],
    (e) => [null, e]
  );
  if (error) {
    return [null, error];
  }

  return Chess.fromSetup(setup).unwrap(
    (v) => [v, null],
    (e) => [null, e]
  );
}
