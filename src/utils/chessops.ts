import { ANNOTATION_INFO, isBasicAnnotation } from "@/utils/annotation";
import { formatScore } from "@/utils/score";
import {
  GameHeaders,
  treeIteratorMainLine,
  TreeNode,
} from "@/utils/tree-reducer";
import {
  Chess,
  type Color,
  makeUci,
  type Move,
  parseUci,
  type PositionError,
  type Square,
  squareFile,
  squareRank,
} from "chessops";
import { castlingSide, IllegalSetup, normalizeMove } from "chessops/chess";
import {
  FenError,
  INITIAL_FEN,
  InvalidFen,
  makeFen,
  parseFen,
} from "chessops/fen";
import { parseSan } from "chessops/san";
import { match } from "ts-pattern";

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

export function parseSanOrUci(pos: Chess, sanOrUci: string): Move | null {
  const sanParsed = parseSan(pos, sanOrUci);
  if (sanParsed) {
    return sanParsed;
  }

  const uciParsed = parseUci(sanOrUci);
  if (uciParsed) {
    return uciParsed;
  }

  return null;
}

export function squareToCoordinates(
  square: Square,
  orientation: "white" | "black"
) {
  let file = squareFile(square) + 1;
  let rank = squareRank(square) + 1;
  if (orientation === "black") {
    file = 9 - file;
    rank = 9 - rank;
  }
  return { file, rank };
}

function headersToPGN(game: GameHeaders): string {
  let headers = `[Event "${game.event || "?"}"]
[Site "${game.site || "?"}"]
[Date "${game.date || "????.??.??"}"]
[Round "${game.round || "?"}"]
[White "${game.white || "?"}"]
[Black "${game.black || "?"}"]
[Result "${game.result}"]
`;
  if (game.white_elo) {
    headers += `[WhiteElo "${game.white_elo}"]\n`;
  }
  if (game.black_elo) {
    headers += `[BlackElo "${game.black_elo}"]\n`;
  }
  if (game.start && game.start.length > 0) {
    headers += `[Start "${JSON.stringify(game.start)}"]\n`;
  }
  if (game.orientation) {
    headers += `[Orientation "${game.orientation}"]\n`;
  }
  if (game.time_control) {
    headers += `[TimeControl "${game.time_control}"]\n`;
  }
  if (game.white_time_control) {
    headers += `[WhiteTimeControl "${game.white_time_control}"]\n`;
  }
  if (game.black_time_control) {
    headers += `[BlackTimeControl "${game.black_time_control}"]\n`;
  }
  if (game.eco) {
    headers += `[ECO "${game.eco}"]\n`;
  }
  if (game.variant) {
    headers += `[Variant "${game.variant}"]\n`;
  }
  return headers;
}

export const makeClk = (seconds: number): string => {
  let s = Math.max(0, seconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  s = (s % 3600) % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${s.toLocaleString(
    "en",
    {
      minimumIntegerDigits: 2,
      maximumFractionDigits: 3,
    }
  )}`;
};

export function getMoveText(
  tree: TreeNode,
  opt: {
    glyphs: boolean;
    comments: boolean;
    extraMarkups: boolean;
    isFirst?: boolean;
  }
): string {
  const isBlack = tree.halfMoves % 2 === 0;
  const moveNumber = Math.ceil(tree.halfMoves / 2);
  let moveText = "";

  if (tree.san) {
    if (isBlack) {
      if (opt.isFirst) {
        moveText += `${moveNumber}... `;
      }
    } else {
      moveText += `${moveNumber}. `;
    }
    moveText += tree.san;
    if (opt.glyphs) {
      for (const annotation of tree.annotations) {
        if (annotation === "") continue;
        moveText += isBasicAnnotation(annotation)
          ? tree.annotations
          : ` $${ANNOTATION_INFO[annotation].nag}`;
      }
    }
    moveText += " ";
  }

  if (opt.comments || opt.extraMarkups) {
    let content = "{";

    if (opt.extraMarkups) {
      if (tree.score !== null) {
        if (tree.score.value.type === "cp") {
          content += `[%eval ${formatScore(tree.score.value)}] `;
        } else {
          content += `[%eval #${tree.score.value.value}] `;
        }
      }
      if (tree.clock !== undefined) {
        content += `[%clk ${makeClk(tree.clock)}] `;
      }
    }

    if (opt.extraMarkups && tree.shapes.length > 0) {
      const squares = tree.shapes.filter((shape) => shape.dest === undefined);
      const arrows = tree.shapes.filter((shape) => shape.dest !== undefined);

      if (squares.length > 0) {
        content += `[%csl ${squares
          .map((shape) => {
            return shape.brush![0].toUpperCase() + shape.orig;
          })
          .join(",")}]`;
      }
      if (arrows.length > 0) {
        content += `[%cal ${arrows
          .map((shape) => {
            return shape.brush![0].toUpperCase() + shape.orig + shape.dest;
          })
          .join(",")}]`;
      }
    }

    if (opt.comments && tree.comment !== "") {
      content += tree.comment;
    }
    content += "} ";

    if (content !== "{} ") {
      moveText += content;
    }
  }
  return moveText;
}

export function getPGN(
  tree: TreeNode,
  {
    headers,
    glyphs,
    comments,
    variations,
    extraMarkups,
    root = true,
    path = null,
  }: {
    headers: GameHeaders | null;
    glyphs: boolean;
    comments: boolean;
    variations: boolean;
    extraMarkups: boolean;
    root?: boolean;
    path?: number[] | null;
  }
): string {
  if (path && path.length === 0) {
    return "";
  }
  let pgn = "";
  if (headers) {
    pgn += headersToPGN(headers);
  }
  if (root && tree.fen !== INITIAL_FEN) {
    pgn += '[SetUp "1"]\n';
    pgn += `[FEN "${tree.fen}"]\n`;
  }
  pgn += "\n";
  const variationsPGN = variations
    ? tree.children.slice(1).map(
        (variation) =>
          `${getMoveText(variation, {
            glyphs,
            comments,
            extraMarkups,
            isFirst: true,
          })} ${getPGN(variation, {
            headers: null,
            glyphs,
            comments,
            variations,
            extraMarkups,
            root: false,
            path: null,
          })}`
      )
    : [];
  if (tree.children.length > 0) {
    const child = tree.children[path ? path[0] : 0];
    pgn += getMoveText(child, {
      glyphs: glyphs,
      comments,
      extraMarkups,
      isFirst: root,
    });
  }
  if (!path) {
    for (const variation of variationsPGN) {
      pgn += ` (${variation}) `;
    }
  }

  if (tree.children.length > 0) {
    pgn += getPGN(tree.children[path ? path[0] : 0], {
      headers: null,
      glyphs,
      comments,
      variations,
      extraMarkups,
      root: false,
      path: path ? path.slice(1) : null,
    });
  }
  if (root && headers) {
    pgn += ` ${headers.result}`;
  }
  return pgn.trim();
}

export function getMovePairs(root: TreeNode): [TreeNode, TreeNode | null][] {
  const movePairs: [TreeNode, TreeNode | null][] = [];
  const iterator = treeIteratorMainLine(root);

  iterator.next(); //루트 노드 건너뛰기

  let whiteMove = iterator.next().value?.node;
  while (whiteMove) {
    let blackMove = iterator.next().value?.node || null;
    movePairs.push([whiteMove, blackMove]);
    whiteMove = iterator.next().value?.node;
  }

  return movePairs;
}

export function swapMove(fen: string, color?: Color) {
  const setup = parseFen(fen).unwrap();
  if (color) {
    setup.turn = color;
  } else {
    setup.turn = setup.turn === "white" ? "black" : "white";
  }

  return makeFen(setup);
}

export function uciNormalize(chess: Chess, move: Move, chess960?: boolean) {
  const side = castlingSide(chess, move);
  const frcMove = normalizeMove(chess, move);
  if (side && !chess960) {
    const standardMove = match(makeUci(frcMove))
      .with("e1h1", () => "e1g1")
      .with("e1a1", () => "e1c1")
      .with("e8h8", () => "e8g8")
      .with("e8a8", () => "e8c8")
      .otherwise((v) => v);
    return standardMove;
  }
  return makeUci(frcMove);
}

export function getVariationLine(
  root: TreeNode,
  position: number[],
  chess960?: boolean,
  includeLastMove = false
): string[] {
  const moves = [];
  let node = root;
  const [chess] = positionFromFen(root.fen);
  if (!chess) {
    return [];
  }
  for (const pos of position) {
    node = node.children[pos];
    if (node.move) {
      moves.push(uciNormalize(chess, node.move, chess960));
      chess.play(node.move);
    }
  }
  if (includeLastMove && node.children.length > 0) {
    moves.push(uciNormalize(chess, node.children[0].move!, chess960));
  }
  return moves;
}

export function chessopsError(error: PositionError | FenError) {
  return match(error)
    .with({ message: IllegalSetup.Empty }, () => "Errors.EmptyBoard")
    .with({ message: IllegalSetup.Kings }, () => "Errors.InvalidKings")
    .with({ message: IllegalSetup.OppositeCheck }, () => "Errors.OppositeCheck")
    .with(
      { message: IllegalSetup.PawnsOnBackrank },
      () => "Errors.PawnsOnBackrank"
    )
    .with({ message: InvalidFen.Board }, () => "Errors.InvalidBoard")
    .with(
      { message: InvalidFen.Castling },
      () => "Errors.InvalidCastlingRights"
    )
    .with({ message: InvalidFen.EpSquare }, () => "Errors.InvalidEpSquare")
    .with({ message: InvalidFen.Fen }, () => "Errors.InvalidFen")
    .with({ message: InvalidFen.Fullmoves }, () => "Errors.InvalidFullmoves")
    .with({ message: InvalidFen.Halfmoves }, () => "Errors.InvalidHalfmoves")
    .with({ message: InvalidFen.Pockets }, () => "Errors.InvalidPockets")
    .with(
      { message: InvalidFen.RemainingChecks },
      () => "Errors.InvalidRemainingChecks"
    )
    .with({ message: InvalidFen.Turn }, () => "Errors.InvalidTurn")
    .otherwise(() => "Errors.Unknown");
}
