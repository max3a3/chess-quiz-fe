let lastTime = 0;

export function playSound(capture: boolean, check: boolean) {
  const now = Date.now();
  if (now - lastTime < 75) {
    return;
  }
  lastTime = now;

  let type = "Move";
  if (capture) {
    type = "Capture";
  }
  if (check) {
    type = "Check";
  }

  const audio = new Audio(`/sound/robot/${type}.mp3`);
  audio.volume = 1;
  audio.play();
}
