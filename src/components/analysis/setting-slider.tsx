import { Slider } from "@/components/ui/slider";

const SettingSlider = ({
  value,
  setValue,
  max,
}: {
  value: number;
  setValue: (v: number) => void;
  max: number;
}) => {
  return (
    <Slider
      min={0}
      max={max}
      value={[value]}
      onValueChange={(value) => setValue(value[0])}
      step={1}
    />
  );
};

export default SettingSlider;
