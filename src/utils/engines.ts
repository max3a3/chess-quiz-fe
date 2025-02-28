import { z } from "zod";

export type PlayersTime = {
  white: number;
  black: number;
  winc: number;
  binc: number;
};
export type GoMode =
  | { t: "PlayersTime"; c: PlayersTime }
  | { t: "Depth"; c: number }
  | { t: "Time"; c: number }
  | { t: "Nodes"; c: number }
  | { t: "Infinite" };

const goModeSchema: z.ZodSchema<GoMode> = z.union([
  z.object({
    t: z.literal("Depth"),
    c: z.number(),
  }),
  z.object({
    t: z.literal("Time"),
    c: z.number(),
  }),
  z.object({
    t: z.literal("Nodes"),
    c: z.number(),
  }),
  z.object({
    t: z.literal("Infinite"),
  }),
]);

const engineSettingsSchema = z.array(
  z.object({
    name: z.string(),
    value: z.string().or(z.number()).or(z.boolean()).nullable(),
  })
);

export type EngineSettings = z.infer<typeof engineSettingsSchema>;

const localEngineSchema = z.object({
  type: z.literal("local"),
  name: z.string(),
  short: z.string().nullish(),
  tech: z.string(),
  requires: z.array(z.string()),
  minMem: z.number().nullish(),
  minThreads: z.number().nullish(),
  //로컬 wasm 기반 엔진 지원 추가
  assets: z.object({
    version: z.string(),
    root: z.string(),
    js: z.string(),
    wasm: z.string().nullish(),
  }),
  image: z.string().nullish(),
  elo: z.number().nullish(),
  downloadSize: z.number().nullish(),
  downloadLink: z.string().nullish(),
  loaded: z.boolean().nullish(),
  go: goModeSchema.nullish(),
  enabled: z.boolean().nullish(),
  settings: engineSettingsSchema.nullish(),
});

export type LocalEngine = z.infer<typeof localEngineSchema>;

const remoteEngineSchema = z.object({
  type: z.enum(["chessdb", "lichess"]),
  name: z.string(),
  url: z.string(),
  image: z.string().nullish(),
  loaded: z.boolean().nullish(),
  enabled: z.boolean().nullish(),
  go: goModeSchema.nullish(),
  settings: engineSettingsSchema.nullish(),
});

export type RemoteEngine = z.infer<typeof remoteEngineSchema>;

export const engineSchema = z.union([localEngineSchema, remoteEngineSchema]);
export type Engine = z.infer<typeof engineSchema>;
