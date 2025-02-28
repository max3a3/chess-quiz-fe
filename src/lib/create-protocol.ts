import { parseUci } from "chessops";
import { makeSan } from "chessops/san";
import { match, P } from "ts-pattern";

import { positionFromFen } from "@/utils/chessops";
import { BestMoves } from "@/utils/types";
import { defined } from "@/lib/utils";

export type SearchBy =
  | { movetime: number }
  | { depth: number }
  | { nodes: number };

export interface EvalResult {
  progress: number;
  fen: string;
  depth: number;
  nodes: number;
  time: number;
  bestMoves: BestMoves[];
}

export interface Work {
  search?: SearchBy;
  threads: number;
  hashSize: number;
  multiPv: number;
  initialFen: string;
  currentFen: string;
  moves: string[];
  turn: "black" | "white";
  threat: boolean;
  eval?: EvalResult;
  emit?: (_eval: EvalResult) => void;
  stopRequested: boolean;
}

export interface Protocol {
  connected: (send: SendCommand) => void;
  received: (command: string) => void;
  compute: (work: Work) => void;
  stop: () => void;
  isComputing: () => boolean;
}

type SendCommand = (command: string) => void;

export function createProtocol(): Protocol {
  let sendCommand: SendCommand | undefined;
  let currentWork: Work | null = null;
  let nextWork: Work | null = null;
  let options = new Map([
    ["Threads", "1"],
    ["Hash", "16"],
    ["MultiPV", "1"],
  ]);
  let expectedPvs = 1;
  let currentEval: EvalResult | undefined;

  function connected(send: SendCommand) {
    sendCommand = send;
    sendCommand("uci");
  }

  function received(command: string) {
    const parts = command.trim().split(/\s+/g);
    if (parts[0] === "uciok") {
      setOption("UCI_AnalyseMode", "true");
      setOption("Analysis Contempt", "Off");
      // Affects notation only. Life would be easier if everyone would always
      // unconditionally use this mode.
      setOption("UCI_Chess960", "true");
      sendCommand?.("ucinewgame");
      sendCommand?.("isready");
    } else if (parts[0] === "readyok") {
      swapWork();
    } else if (parts[0] === "bestmove") {
      if (currentWork && currentEval) currentWork.emit?.(currentEval);
      currentWork = null;
      swapWork();
    } else if (currentWork && parts[0] === "info") {
      processInfo(parts, currentWork.currentFen);
    }
  }

  function setOption(name: string, value: string | number): void {
    value = value.toString();
    if (sendCommand && options.get(name) !== value) {
      sendCommand(`setoption name ${name} value ${value}`);
      options.set(name, value);
    }
  }

  function processInfo(parts: string[], fen: string) {
    let time = 0,
      depth = 0,
      nodes = 0,
      isMate = false,
      povEv,
      multipv = 0,
      nps = 0,
      sanMoves: string[] = [],
      uciMoves: string[] = [];

    let hasPv = false;

    for (let i = 1; i < parts.length; i++) {
      switch (parts[i]) {
        case "depth":
          depth = parseInt(parts[++i]);
          break;
        case "nodes":
          nodes = parseInt(parts[++i]);
          break;
        case "score":
          isMate = parts[++i] === "mate";
          povEv = parseInt(parts[++i]);
          break;
        case "multipv":
          multipv = parseInt(parts[++i]);
          break;
        case "nps":
          nps = parseInt(parts[++i]);
          break;
        case "time":
          time = parseInt(parts[++i]);
          break;
        case "pv":
          const moves = parts.slice(++i);
          const [pos] = positionFromFen(fen);
          for (const _move of moves) {
            if (!pos) break;
            const move = parseUci(_move);
            if (!move) break;
            const san = makeSan(pos, move);
            if (san === "--") break;
            pos.play(move);
            uciMoves.push(_move);
            sanMoves.push(san);
          }
          i = parts.length;
          hasPv = true;
          break;
      }
    }

    if (!currentWork || !hasPv) return;
    if (expectedPvs < multipv) expectedPvs = multipv;
    if (isMate && !povEv) return;
    if (
      !defined(nodes) ||
      !defined(time) ||
      !defined(isMate) ||
      !defined(povEv)
    )
      return;

    const ev = currentWork.turn === "black" ? -povEv : povEv;

    const bestMoves: BestMoves = {
      depth,
      nodes,
      score: {
        value: { type: isMate ? "mate" : "cp", value: ev },
        wdl: null,
      },
      multipv,
      nps,
      sanMoves,
      uciMoves,
    };

    if (multipv === 1) {
      currentEval = {
        progress: currentWork.search
          ? match(currentWork.search)
              .with({ movetime: P.number }, (v) =>
                Math.min((time / v.movetime) * 100, 100)
              )
              .with({ nodes: P.number }, (v) =>
                Math.min((nodes / v.nodes) * 100)
              )
              .with({ depth: P.number }, (v) =>
                Math.min((depth / v.depth) * 100)
              )
              .exhaustive()
          : 99.99,
        fen: currentWork.currentFen,
        depth,
        nodes,
        time,
        bestMoves: [bestMoves],
      };
    } else if (currentEval) {
      currentEval.bestMoves.push(bestMoves);
      currentEval.depth = Math.min(currentEval.depth, depth);
    }

    if (multipv === expectedPvs && currentEval) {
      currentWork.emit?.(currentEval);
      if (depth >= 99) stop();
    }
  }

  function compute(work: Work) {
    nextWork = work;
    stop();
    swapWork();
  }

  function swapWork() {
    if (!sendCommand || currentWork) return;

    currentWork = nextWork;
    nextWork = null;

    if (!currentWork) return;

    setOption("Threads", currentWork.threads);
    setOption("Hash", currentWork.hashSize);
    setOption("MultiPV", currentWork.multiPv);

    sendCommand(
      [
        "position fen",
        currentWork.initialFen,
        "moves",
        ...currentWork.moves,
      ].join(" ")
    );

    if (currentWork.search) {
      const [by, value] = Object.entries(currentWork.search)[0];
      sendCommand(`go ${by} ${value}`);
    } else {
      sendCommand("go infinite");
    }
  }

  function stop() {
    if (currentWork && !currentWork.stopRequested) {
      currentWork.stopRequested = true;
      sendCommand?.("stop");
    }
  }

  function isComputing(): boolean {
    return !!currentWork && !currentWork.stopRequested;
  }

  return { connected, received, compute, stop, isComputing };
}
