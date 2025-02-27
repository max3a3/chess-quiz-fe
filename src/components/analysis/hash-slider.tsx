import { useEffect, useState } from "react";

import { Slider } from "@/components/ui/slider";

const memorySize = 512;

const HashSlider = ({
  value,
  setValue,
}: {
  value: number;
  setValue: (v: number) => void;
}) => {
  const [tempValue, setTempValue] = useState(Math.log2(value));

  useEffect(() => {
    setTempValue(Math.log2(value));
  }, [value]);

  return (
    <Slider
      min={0}
      max={Math.log2(memorySize || 16)}
      value={[tempValue]}
      onValueChange={(value) => {
        setTempValue(value[0]);
        setValue(2 ** value[0]);
      }}
    />
  );
};

export default HashSlider;
