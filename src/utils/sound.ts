import { soundCollectionAtom, soundVolumeAtom } from "@/state/atoms";
import { getDefaultStore } from "jotai";

let lastTime = 0;

export function playSound(capture: boolean, check: boolean) {
  const now = Date.now();
  if (now - lastTime < 75) {
    return;
  }
  lastTime = now;

  const store = getDefaultStore();
  const collection = store.get(soundCollectionAtom);
  const volume = store.get(soundVolumeAtom);

  let type = "Move";
  if (capture) {
    type = "Capture";
  }
  if (check) {
    type = "Check";
  }

  const audio = new Audio(`/sound/${collection}/${type}.mp3`);
  audio.volume = volume;
  audio.play();
}
