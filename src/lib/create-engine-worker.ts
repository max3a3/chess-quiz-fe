import type StockfishWeb from "lila-stockfish-web";

import { createProtocol, Protocol } from "@/lib/create-protocol";
import { sharedWasmMemory } from "@/lib/utils";
import { LocalEngine } from "@/utils/engines";
import { loadIife, url } from "@/lib/site";

interface WasmModule {
  (opts: {
    wasmBinary?: ArrayBuffer;
    locateFile(path: string): string;
    wasmMemory: WebAssembly.Memory;
    printErr(msg: string): void;
    onError(err: Error): void;
  }): Promise<Stockfish>;
}

interface Stockfish {
  addMessageListener(cb: (msg: string) => void): void;
  postMessage(msg: string): void;
}

declare global {
  interface Window {
    Stockfish?: WasmModule;
    StockfishMv?: WasmModule;
  }
}

export interface Worker {
  module: Stockfish | StockfishWeb;
  protocol: Protocol;
  destroy: () => void;
}

async function createThreadEngine(engineInfo: LocalEngine) {
  try {
    const { root, js, version: pathVersion } = engineInfo.assets;
    const moduleUrl = `${root}/${js}`;

    await loadIife(/* @vite-ignore */ moduleUrl, { pathVersion });

    const module = await window["Stockfish"]!({
      printErr: (msg: string) => {
        throw new Error(msg);
      },
      onError: (err) => {
        throw err;
      },
      locateFile: (file: string) =>
        new URL(`${root}/${file}`, import.meta.url).href,
      wasmMemory: sharedWasmMemory(engineInfo.minMem!),
    });

    const protocol = createProtocol();
    module.addMessageListener((msg) => protocol.received(msg));
    protocol.connected((cmd: string) => module.postMessage(cmd));

    const destroy = () => {
      module?.postMessage("quit");
    };

    return { module, protocol, destroy };
  } catch (error) {
    throw error;
  }
}

async function createStockFishWebEngine(engineInfo: LocalEngine) {
  try {
    const { root, js, version: pathVersion } = engineInfo.assets;

    const makeModule = await import(
      url(/* @vite-ignore */ `${root}/${js}`, {
        pathVersion,
        documentOrigin: true,
      })
    );

    const module: StockfishWeb = await makeModule.default({
      wasmMemory: sharedWasmMemory(engineInfo.minMem!),
      onError: (msg: string) => Promise.reject(new Error(msg)),
      locateFile: (file: string) =>
        new URL(`${root}/${file}`, import.meta.url).href,
    });

    const protocol = createProtocol();
    module.listen = (data: string) => protocol.received(data);
    protocol.connected((cmd: string) => module.uci(cmd));

    const destroy = () => {
      module?.uci("quit");
    };

    return { module, protocol, destroy };
  } catch (error) {
    throw error;
  }
}

export async function createStockfishWorker(
  engineInfo: LocalEngine,
  statusCallback?: React.Dispatch<React.SetStateAction<string>>
): Promise<Worker | undefined> {
  try {
    if (engineInfo.tech === "HCE") {
      return await createThreadEngine(engineInfo);
    } else if (engineInfo.tech === "NNUE") {
      return await createStockFishWebEngine(engineInfo);
    }
  } catch (error) {
    statusCallback?.(error as string);
    throw error;
  }
}
