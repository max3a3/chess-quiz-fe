import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showMarks?: boolean;
  showTooltip?: boolean;
  interval?: number;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      onValueChange,
      showMarks = false,
      showTooltip = false,
      ...props
    },
    ref
  ) => {
    const [, setValue] = React.useState<number[]>(
      (props.defaultValue as number[]) ?? (props.value as number[]) ?? [0]
    );
    const [innerInterval] = React.useState<number>(
      props.interval ?? props.step ?? 25
    );
    const numberOfMarks = Math.floor((props.max ?? 100) / innerInterval) + 1;
    const marks = Array.from(
      { length: numberOfMarks },
      (_, i) => i * innerInterval
    );

    function calculateTickPercent(index: number, max: number): number {
      // Calculate the percentage from left of the slider's width
      const percent = ((index * innerInterval) / max) * 100;
      return percent;
    }

    function handleValueChange(v: number[]) {
      setValue(v);
      if (onValueChange) onValueChange(v);
    }

    const [showTooltipState, setShowTooltipState] = React.useState(false);
    const handlePointerDown = () => {
      setShowTooltipState(true);
    };

    const handlePointerUp = () => {
      setShowTooltipState(false);
    };

    React.useEffect(() => {
      document.addEventListener("pointerup", handlePointerUp);
      return () => {
        document.removeEventListener("pointerup", handlePointerUp);
      };
    }, []);

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        onValueChange={handleValueChange}
        onPointerDown={handlePointerDown}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-primary">
          <SliderPrimitive.Range className="absolute h-full bg-blue-500" />
          {showMarks &&
            marks.map(
              (_, i) =>
                i !== 0 &&
                i !== marks.length - 1 && (
                  <Circle
                    id={`${i}`}
                    key={`${i}`}
                    role="presentation"
                    className="text-sm text-white bg-white size-1 rounded-full absolute top-0.5"
                    style={{
                      left: `${calculateTickPercent(i, props.max ?? 100)}%`,
                      translate: `-${calculateTickPercent(i, props.max ?? 100)}%`,
                    }}
                    strokeWidth="3px"
                  />
                )
            )}
        </SliderPrimitive.Track>
        <TooltipProvider>
          <Tooltip open={showTooltip && showTooltipState}>
            <TooltipTrigger asChild>
              <SliderPrimitive.Thumb
                className="block size-4 rounded-full border-2 border-primary bg-background ring-offset-background cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50"
                onMouseEnter={() => setShowTooltipState(true)}
                onMouseLeave={() => setShowTooltipState(false)}
              />
            </TooltipTrigger>
            <TooltipContent className="w-auto p-2 mb-1">
              <p className="font-medium">{props.value?.[0]}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>{" "}
      </SliderPrimitive.Root>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
