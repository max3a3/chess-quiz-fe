import { z } from "zod";
import {
  atomFamily,
  atomWithStorage,
  createJSONStorage,
  loadable,
} from "jotai/utils";
import { atom, PrimitiveAtom } from "jotai/vanilla";
import { AtomFamily } from "jotai/vanilla/utils/atomFamily";
import { INITIAL_FEN, makeFen } from "chessops/fen";
import { parseUci } from "chessops";
import equal from "fast-deep-equal";

import {
  createAsyncZodStorage,
  createZodStorage,
  genID,
  indexedDBStorage,
} from "@/lib/utils";
import { Tab, tabSchema } from "@/utils/tabs";
import { Engine, engineSchema, EngineSettings, GoMode } from "@/utils/engines";
import { getWinChance, normalizeScore } from "@/utils/score";
import { positionFromFen, swapMove } from "@/utils/chessops";
import { BestMoves } from "@/utils/types";

const zodArray = <S>(itemSchema: z.ZodType<S>) => {
  const catchValue = {} as never;

  const res = z
    .array(itemSchema.catch(catchValue))
    .transform((a) => a.filter((o) => o !== catchValue))
    .catch([]);

  return res as z.ZodType<S[]>;
};

const firstTab: Tab = {
  name: "New Tab",
  value: genID(),
  type: "new",
};

export const tabsAtom = atomWithStorage<Tab[]>(
  "tabs",
  [firstTab],
  createZodStorage(z.array(tabSchema), sessionStorage)
);

export const activeTabAtom = atomWithStorage<string | null>(
  "activeTab",
  firstTab.value,
  createJSONStorage(() => sessionStorage)
);

export const currentTabAtom = atom(
  (get) => {
    const tabs = get(tabsAtom);
    const activeTab = get(activeTabAtom);
    return tabs.find((tab) => tab.value === activeTab);
  },
  (get, set, newValue: Tab | ((currentTab: Tab) => Tab)) => {
    const tabs = get(tabsAtom);
    const activeTab = get(activeTabAtom);
    const nextValue =
      typeof newValue === "function"
        ? newValue(get(currentTabAtom)!)
        : newValue;
    const newTabs = tabs.map((tab) => {
      if (tab.value === activeTab) {
        return nextValue;
      }
      return tab;
    });
    set(tabsAtom, newTabs);
  }
);

export const activePuzzleAtom = atomWithStorage<string | null>(
  "activePuzzle",
  null,
  createJSONStorage(() => sessionStorage)
);

function tabValue<
  T extends object | string | boolean | number | null | undefined,
>(family: AtomFamily<string, PrimitiveAtom<T>>) {
  return atom(
    (get) => {
      const tab = get(currentTabAtom);
      if (!tab) throw new Error("No tab selected");
      const atom = family(tab.value);
      return get(atom);
    },
    (get, set, newValue: T | ((currentValue: T) => T)) => {
      const tab = get(currentTabAtom);
      if (!tab) throw new Error("No tab selected");
      const nextValue =
        typeof newValue === "function"
          ? newValue(get(tabValue(family)))
          : newValue;
      const atom = family(tab.value);
      set(atom, nextValue);
    }
  );
}

export const scoreTypeFamily = atomFamily((_: string) =>
  atom<"cp" | "wdl">("cp")
);

export const snapArrowsAtom = atomWithStorage<boolean>("snap-dests", true);
export const showArrowsAtom = atomWithStorage<boolean>("show-arrows", true);
export const showConsecutiveArrowsAtom = atomWithStorage<boolean>(
  "show-consecutive-arrows",
  false
);
export const jumpToNextPuzzleAtom = atomWithStorage<boolean>(
  "puzzle-jump-immediately",
  true
);

export const previewBoardOnHoverAtom = atomWithStorage<boolean>(
  "preview-board-on-hover",
  true
);

export const moveNotationTypeAtom = atomWithStorage<"letters" | "symbols">(
  "letters",
  "symbols"
);

const engines: Engine[] = [
  {
    type: "local",
    name: "Stockfish 16 NNUE · 7MB",
    short: "SF 16 · 7MB",
    tech: "NNUE",
    requires: ["sharedMem", "simd", "dynamicImportFromWorker"],
    minMem: 1536,
    assets: {
      version: "sfw008",
      root: "/node_modules/lila-stockfish-web",
      js: "sf16-7.js",
    },
    loaded: true,
    settings: [
      {
        name: "MultiPV",
        value: 1,
      },
      { name: "Threads", value: 1 },
      { name: "Hash", value: 4 },
    ],
  },
  {
    type: "local",
    name: "Stockfish 17 NNUE · 79MB",
    short: "SF 17 · 79MB",
    tech: "NNUE",
    requires: ["sharedMem", "simd", "dynamicImportFromWorker"],
    minMem: 2560,
    assets: {
      version: "sfw008",
      root: "/node_modules/lila-stockfish-web",
      js: "sf16-7.js",
    },
    loaded: true,
    settings: [
      {
        name: "MultiPV",
        value: 1,
      },
      { name: "Threads", value: 1 },
      { name: "Hash", value: 4 },
    ],
  },
  {
    type: "local",
    name: "Stockfish 11 HCE",
    short: "SF 11",
    tech: "HCE",
    requires: ["sharedMem"],
    minThreads: 1,
    minMem: 1024,
    assets: {
      version: "a022fa",
      root: "/node_modules/stockfish.wasm",
      js: "stockfish.js",
      wasm: "stockfish.wasm",
    },
    loaded: true,
    settings: [
      {
        name: "MultiPV",
        value: 1,
      },
      { name: "Threads", value: 1 },
      { name: "Hash", value: 4 },
    ],
  },
];

export const enginesAtom = atomWithStorage<Engine[]>(
  "engines/engines.json",
  engines,
  createAsyncZodStorage(zodArray(engineSchema), indexedDBStorage)
);

export const selectedEngineAtom = atomWithStorage<Engine | null>(
  "selectedEngine",
  null,
  createJSONStorage(() => sessionStorage)
);

const loadableEnginesAtom = loadable(enginesAtom);

export const engineMovesFamily = atomFamily(
  ({}: { tab: string; engine: string; puzzle: string }) =>
    atom<Map<string, BestMoves[]>>(new Map()),
  (a, b) => a.tab === b.tab && a.engine === b.engine && a.puzzle === b.puzzle
);

export const engineProgressFamily = atomFamily(
  ({}: { tab: string; engine: string }) => atom<number>(0),
  (a, b) => a.tab === b.tab && a.engine === b.engine
);

// returns the best moves of each engine for the current position
export const bestMovesFamily = atomFamily(
  ({ fen, gameMoves }: { fen: string; gameMoves: string[] }) =>
    atom<Map<number, { pv: string[]; winChance: number }[]>>((get) => {
      const tab = get(activeTabAtom);
      const puzzle = get(activePuzzleAtom);
      if (!tab || !puzzle) return new Map();
      const engines = get(loadableEnginesAtom);
      if (!(engines.state === "hasData")) return new Map();
      const bestMoves = new Map<
        number,
        { pv: string[]; winChance: number }[]
      >();
      let n = 0;
      for (const engine of engines.data.filter((e) => e.loaded)) {
        const engineMoves = get(
          engineMovesFamily({ tab, puzzle, engine: engine.name })
        );
        const [pos] = positionFromFen(fen);
        let finalFen = INITIAL_FEN;
        if (pos) {
          for (const move of gameMoves) {
            const m = parseUci(move);
            pos.play(m!);
          }
          finalFen = makeFen(pos.toSetup());
        }
        const moves =
          engineMoves.get(`${swapMove(finalFen)}:`) ||
          engineMoves.get(`${fen}:${gameMoves.join(",")}`);
        if (moves && moves.length > 0) {
          const bestWinChange = getWinChance(
            normalizeScore(moves[0].score.value, pos?.turn || "white")
          );
          bestMoves.set(
            n,
            moves.reduce<{ pv: string[]; winChance: number }[]>((acc, m) => {
              const winChance = getWinChance(
                normalizeScore(m.score.value, pos?.turn || "white")
              );
              if (bestWinChange - winChance < 10) {
                acc.push({ pv: m.uciMoves, winChance });
              }
              return acc;
            }, [])
          );
        }
        n++;
      }
      return bestMoves;
    }),
  (a, b) => a.fen === b.fen && equal(a.gameMoves, b.gameMoves)
);

export const tabEngineSettingsFamily = atomFamily(
  ({
    defaultSettings,
    defaultGo,
  }: {
    tab: string;
    engineName: string;
    defaultSettings?: EngineSettings;
    defaultGo?: GoMode;
  }) => {
    return atom<{
      enabled: boolean;
      settings: EngineSettings;
      go: GoMode;
      synced: boolean;
    }>({
      enabled: false,
      settings: defaultSettings || [],
      go: defaultGo || { t: "Infinite" },
      synced: true,
    });
  },
  (a, b) => a.tab === b.tab && a.engineName === b.engineName
);

const threatFamily = atomFamily((_: string) => atom(false));
export const currentThreatAtom = tabValue(threatFamily);

const evalOpenFamily = atomFamily((_: string) => atom(true));
export const currentEvalOpenAtom = tabValue(evalOpenFamily);
