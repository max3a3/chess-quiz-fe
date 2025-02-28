import { Slider } from "@/components/ui/slider";
import { soundVolumeAtom } from "@/state/atoms";
import { playSound } from "@/utils/sound";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

const VolumeSlider = () => {
  const [volume, setVolume] = useAtom(soundVolumeAtom);
  const [tempVolume, setTempVolume] = useState(volume * 100);

  useEffect(() => {
    setTempVolume(volume * 100);
  }, [volume]);

  return (
    <Slider
      min={0}
      step={1}
      max={100}
      interval={25}
      showMarks
      showTooltip
      value={[tempVolume]}
      onValueChange={(value) => setTempVolume(value[0])}
      onValueCommit={(value) => {
        setVolume(value[0] / 100);
        playSound(false, false);
      }}
      className="w-60"
    />
  );
};

export default VolumeSlider;
