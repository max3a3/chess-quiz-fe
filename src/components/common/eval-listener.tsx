import { parseUci } from "chessops";
import { INITIAL_FEN, makeFen } from "chessops/fen";
import { useAtom, useAtomValue } from "jotai";
import { useContext, useEffect, useMemo, useRef } from "react";
import { match } from "ts-pattern";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import {
  activeTabAtom,
  currentThreatAtom,
  engineMovesFamily,
  engineProgressFamily,
  selectedEngineAtom,
  tabEngineSettingsFamily,
} from "@/state/atoms";
import { getVariationLine } from "@/utils/chessops";
import { positionFromFen, swapMove } from "@/utils/chessops";
import { type Engine, type LocalEngine } from "@/utils/engines";
import { useThrottledEffect } from "@/utils/misc";
import { ChessStateContext } from "@/provider/chess-state-context";
import { createStockfishWorker, Worker } from "@/lib/create-engine-worker";
import { Work } from "@/lib/create-protocol";

function EvalListener() {
  const threat = useAtomValue(currentThreatAtom);
  const store = useContext(ChessStateContext)!;
  const is960 = useStore(store, (s) => s.headers.variant === "Chess960");
  const fen = useStore(store, (s) => s.root.fen);

  const selectedEngine = useAtomValue(selectedEngineAtom);

  const moves = useStore(
    store,
    useShallow((s) => getVariationLine(s.root, s.position, is960))
  );

  const [pos] = positionFromFen(fen);
  if (pos) {
    for (const uci of moves) {
      const move = parseUci(uci);
      if (!move) {
        console.log("Invalid move", uci);
        break;
      }
      pos.play(move);
    }
  }

  pos?.fullmoves;

  const isGameOver = pos?.isEnd() ?? false;
  const finalFen = useMemo(() => (pos ? makeFen(pos.toSetup()) : null), [pos]);

  const { searchingFen, searchingMoves } = useMemo(
    () =>
      match(threat as boolean)
        .with(true, () => ({
          searchingFen: swapMove(finalFen || INITIAL_FEN),
          searchingMoves: [],
        }))
        .with(false, () => ({
          searchingFen: fen,
          searchingMoves: moves,
        }))
        .exhaustive(),
    [fen, moves, threat, finalFen]
  );

  if (!selectedEngine) return null;
  return (
    <EngineListener
      key={selectedEngine.name}
      engine={selectedEngine}
      isGameOver={isGameOver}
      finalFen={finalFen || ""}
      searchingFen={searchingFen}
      searchingMoves={searchingMoves}
      fen={fen}
      moves={moves}
      threat={threat}
      chess960={is960}
    />
  );
}

function EngineListener({
  engine,
  isGameOver,
  finalFen,
  searchingFen,
  searchingMoves,
  fen,
  moves,
  threat,
  chess960,
}: {
  engine: Engine;
  isGameOver: boolean;
  finalFen: string;
  searchingFen: string;
  searchingMoves: string[];
  fen: string;
  moves: string[];
  threat: boolean;
  chess960: boolean;
}) {
  const store = useContext(ChessStateContext)!;
  const root = useStore(store, (s) => s.root);
  const setScore = useStore(store, (s) => s.setScore);
  const activeTab = useAtomValue(activeTabAtom);

  const [, setProgress] = useAtom(
    engineProgressFamily({ engine: engine.name, tab: activeTab! })
  );

  const [, setEngineVariation] = useAtom(
    engineMovesFamily({ engine: engine.name, tab: activeTab! })
  );
  const [settings] = useAtom(
    tabEngineSettingsFamily({
      engineName: engine.name,
      defaultSettings: engine.settings ?? undefined,
      defaultGo: engine.go ?? undefined,
      tab: activeTab!,
    })
  );
  const multiPv = settings.settings.find((o) => o.name === "MultiPV");
  const threads = settings.settings.find((o) => o.name === "Threads");
  const hashSize = settings.settings.find((o) => o.name === "Hash");

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function initEngine() {
      try {
        const worker = await createStockfishWorker(engine as LocalEngine);
        if (!isMounted || !worker) return;
        workerRef.current = worker;
      } catch (error) {
        console.error(error);
      }
    }
    initEngine();
    return () => {
      isMounted = false;
      workerRef.current?.destroy();
      workerRef.current = null;
    };
  }, []);

  //
  const handleCompute = () => {
    if (!workerRef.current) return;
    const { protocol } = workerRef.current;
    const work: Work = {
      stopRequested: false,
      search: match(settings.go)
        .with({ t: "Depth" }, (go) => ({ depth: go.c }))
        .with({ t: "Nodes" }, (go) => ({ nodes: go.c }))
        .with({ t: "Time" }, (go) => ({ movetime: go.c }))
        .otherwise(() => undefined),
      initialFen: threat ? searchingFen : root.fen,
      threads: typeof threads?.value === "number" ? threads.value : 1,
      hashSize: typeof hashSize?.value === "number" ? hashSize.value : 16,
      multiPv: typeof multiPv?.value === "number" ? multiPv.value : 1,
      currentFen: threat ? searchingFen : finalFen,
      moves: searchingMoves,
      threat,
      emit: (result?) => {
        if (!result) return;
        const { progress, bestMoves } = result;
        setProgress(progress);
        setEngineVariation((prev) => {
          const newMap = new Map(prev);
          newMap.set(`${searchingFen}:${searchingMoves.join(",")}`, bestMoves);
          if (threat) {
            newMap.delete(`${fen}:${moves.join(",")}`);
          } else if (finalFen) {
            newMap.delete(`${swapMove(finalFen)}:`);
          }
          return newMap;
        });
        setScore(bestMoves[0].score);
      },
    };
    protocol.compute(work);
  };

  const stopEngine = () => {
    if (!workerRef.current) return;
    const { protocol } = workerRef.current;
    protocol.stop();
  };

  useThrottledEffect(
    () => {
      if (settings.enabled) {
        if (isGameOver) {
          if (engine.type === "local") {
            stopEngine();
          }
        } else {
          const options =
            settings.settings?.map((s) => ({
              name: s.name,
              value: s.value?.toString() || "",
            })) ?? [];
          if (chess960 && !options.find((o) => o.name === "UCI_Chess960")) {
            options.push({ name: "UCI_Chess960", value: "true" });
          }
          handleCompute();
        }
      } else {
        if (engine.type === "local") {
          stopEngine();
        }
      }
    },
    50,
    [
      settings.enabled,
      JSON.stringify(settings.settings),
      settings.go,
      searchingFen,
      JSON.stringify(searchingMoves),
      isGameOver,
      activeTab,
      setEngineVariation,
      engine,
      finalFen,
    ]
  );
  return null;
}

export default EvalListener;
