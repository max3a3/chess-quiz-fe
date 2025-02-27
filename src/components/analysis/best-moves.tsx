import { parseUci } from "chessops";
import { INITIAL_FEN, makeFen } from "chessops/fen";
import equal from "fast-deep-equal";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { SettingsIcon, TargetIcon } from "lucide-react";
import { memo, useCallback, useDeferredValue, useEffect, useMemo } from "react";
import { match } from "ts-pattern";
import { useToggle } from "usehooks-ts";

import AnalysisRow from "@/components/analysis/analysis-row";
import EngineSettingsForm, {
  type Settings,
} from "@/components/analysis/engine-settings-form";
import EngineTrigger from "@/components/analysis/engine-trigger";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  activeTabAtom,
  currentThreatAtom,
  engineMovesFamily,
  engineProgressFamily,
  enginesAtom,
  selectedEngineAtom,
  tabEngineSettingsFamily,
} from "@/state/atoms";
import { chessopsError, positionFromFen, swapMove } from "@/utils/chessops";
import type { Engine } from "@/utils/engines";
import { cn } from "@/lib/utils";
import ActionTooltip from "@/components/ui/action-tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { BestMoves } from "@/utils/types";
import { formatNodes } from "@/utils/format";
import { formatScore } from "@/utils/score";

interface BestMovesProps {
  engine: Engine;
  fen: string;
  moves: string[];
  halfMoves: number;
  orientation: "white" | "black";
}

function BestMovesComponent({
  engine,
  fen,
  moves,
  halfMoves,
  orientation,
}: BestMovesProps) {
  const activeTab = useAtomValue(activeTabAtom);
  const ev = useAtomValue(
    engineMovesFamily({ engine: engine.name, tab: activeTab! })
  );
  const progress = useAtomValue(
    engineProgressFamily({ engine: engine.name, tab: activeTab! })
  );
  const [, setEngines] = useAtom(enginesAtom);
  const [settings, setSettings2] = useAtom(
    tabEngineSettingsFamily({
      engineName: engine.name,
      defaultSettings: engine.settings ?? undefined,
      defaultGo: engine.go ?? undefined,
      tab: activeTab!,
    })
  );
  const setSelectedEngine = useSetAtom(selectedEngineAtom);
  const [engines] = useAtom(enginesAtom);
  const loadedEngines = useMemo(
    () => engines.filter((e) => e.loaded),
    [engines]
  );

  const [settingsOn, toggleSettingsOn, setSettingsOn] = useToggle();

  useEffect(() => {
    if (settings.synced) {
      setSettings2((prev) => ({
        ...prev,
        go: engine.go || prev.go,
        settings: engine.settings || prev.settings,
      }));
    }
  }, [engine.settings, engine.go, settings.synced, setSettings2]);

  const setSettings = useCallback(
    (fn: (prev: Settings) => Settings) => {
      const newSettings = fn(settings);
      setSettings2(newSettings);
      if (newSettings.synced) {
        setEngines(async (prev) =>
          (await prev).map((o) =>
            o.name === engine.name
              ? { ...o, settings: newSettings.settings, go: newSettings.go }
              : o
          )
        );
      }
    },
    [engine, settings, setSettings2, setEngines]
  );

  const [threat, setThreat] = useAtom(currentThreatAtom);

  const [pos, posError] = positionFromFen(fen);
  if (pos) {
    for (const uci of moves) {
      const move = parseUci(uci);
      if (!move) {
        break;
      }
      pos.play(move);
    }
  }

  const isGameOver = pos?.isEnd() ?? false;
  const finalFen = useMemo(() => (pos ? makeFen(pos.toSetup()) : null), [pos]);

  const { searchingFen, searchingMoves } = useMemo(
    () =>
      match(threat)
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

  const [, searchingPosError] = positionFromFen(searchingFen);

  const engineVariations = useDeferredValue(
    useMemo(
      () => ev.get(`${searchingFen}:${searchingMoves.join(",")}`),
      [ev, searchingFen, searchingMoves]
    )
  );

  const error = posError || searchingPosError;

  return (
    <div className="pb-2 bg-zinc-800 rounded-md">
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="flex items-center">
          <EngineTrigger key={engine.name} engine={engine} />
          <Select
            value={engine.name}
            onValueChange={(value) =>
              setSelectedEngine(
                loadedEngines.find((engine) => engine.name === value)!
              )
            }
          >
            <SelectTrigger className="py-0 w-fit bg-transparent border-none text-lg text-muted font-semibold select-none [&>svg]:hidden transition-colors hover:bg-zinc-700">
              <SelectValue placeholder="Engine" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {loadedEngines.map((engine) => (
                <SelectItem
                  key={engine.name}
                  value={engine.name}
                  className="text-muted focus:bg-zinc-700 focus:text-muted"
                >
                  {engine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <EngineTop
          engineVariations={engineVariations}
          isGameOver={isGameOver}
          enabled={settings.enabled}
          progress={progress}
          error={error}
        />
        <div className="flex items-center">
          <ActionTooltip label="Check the opponent's threat">
            <div>
              <Button
                onClick={() => setThreat(!threat)}
                disabled={!settings.enabled}
                size="icon"
                className="bg-inherit hover:bg-inherit hover:opacity-70 transition-opacity"
              >
                <TargetIcon
                  className={cn("size-4", threat && "text-red-600")}
                />
              </Button>
            </div>
          </ActionTooltip>
          <Button
            onClick={toggleSettingsOn}
            size="icon"
            className="bg-inherit hover:bg-inherit hover:opacity-70 transition-opacity"
          >
            <SettingsIcon className="size-4" />
          </Button>
        </div>
      </div>
      <Collapsible open={settingsOn} onOpenChange={setSettingsOn}>
        <CollapsibleContent>
          <EngineSettingsForm settings={settings} setSettings={setSettings} />
        </CollapsibleContent>
      </Collapsible>
      <Progress value={progress} className="h-1 rounded-md" />
      <Table>
        <TableBody>
          {error && (
            <TableRow className="hover:bg-transparent">
              <TableCell className="py-8">
                <p className="text-muted text-center">
                  Invalid position: {chessopsError(error)}
                </p>
              </TableCell>
            </TableRow>
          )}
          {isGameOver && (
            <TableRow className="hover:bg-transparent">
              <TableCell className="py-8">
                <p className="text-muted text-center">Game is over</p>
              </TableCell>
            </TableRow>
          )}
          {engineVariations && engineVariations.length === 0 && !isGameOver && (
            <TableRow className="hover:bg-transparent">
              <TableCell className="py-8">
                <p className="text-muted text-center">No analysis available</p>
              </TableCell>
            </TableRow>
          )}
          {!isGameOver &&
            !error &&
            !engineVariations &&
            (settings.enabled ? (
              [
                ...Array(
                  settings.settings.find((s) => s.name === "MultiPV")?.value ??
                    1
                ),
              ].map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell>
                    <Skeleton className="h-7 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell className="py-8">
                  <p className="text-muted text-center">Engine isn't enabled</p>
                </TableCell>
              </TableRow>
            ))}
          {!error &&
            finalFen &&
            engineVariations &&
            engineVariations.map((engineVariation, index) => {
              return (
                <AnalysisRow
                  key={index}
                  engine={engine.name}
                  moves={engineVariation.sanMoves}
                  score={engineVariation.score}
                  halfMoves={halfMoves}
                  threat={threat}
                  fen={threat ? swapMove(finalFen) : finalFen}
                  orientation={orientation}
                />
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}

function EngineTop({
  engineVariations,
  isGameOver,
  enabled,
  progress,
  error,
}: {
  engineVariations: BestMoves[] | undefined;
  isGameOver: boolean;
  enabled: boolean;
  progress: number;
  error: any;
}) {
  const isComputed = engineVariations && engineVariations.length > 0;
  const depth = isComputed ? engineVariations[0].depth : 0;
  const nps = isComputed ? formatNodes(engineVariations[0].nps) : 0;

  return (
    <div className="flex justify-between flex-1">
      <div className="flex items-center">
        {enabled && !isGameOver && !error && !engineVariations && (
          <div className="p-1 bg-primary rounded-md text-muted text-sm">
            Loading...
          </div>
        )}
        {progress < 100 &&
          enabled &&
          !isGameOver &&
          engineVariations &&
          engineVariations.length > 0 && (
            <ActionTooltip label="How fast the engine is running">
              <div className="p-1 bg-primary rounded-md text-muted text-xs">
                {nps} nodes/s
              </div>
            </ActionTooltip>
          )}
      </div>
      <div className="flex items-center gap-2">
        {!isGameOver && engineVariations && engineVariations.length > 0 && (
          <>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-muted text-xs uppercase">
                Eval
              </span>
              <span className="font-bold text-muted text-sm">
                {formatScore(engineVariations[0].score.value, 1) ?? 0}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-muted text-xs uppercase">
                Depth
              </span>
              <span className="font-bold text-muted text-sm">{depth}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(BestMovesComponent, (prev, next) => {
  return (
    prev.engine === next.engine &&
    prev.fen === next.fen &&
    equal(prev.moves, next.moves) &&
    prev.halfMoves === next.halfMoves &&
    prev.orientation === next.orientation
  );
});
