import { ChevronDown, ChevronUp } from "lucide-react";
import { forwardRef, useCallback, useEffect, useState, useRef } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface NumberInputProps
  extends Omit<NumericFormatProps, "value" | "onValueChange"> {
  stepper?: number;
  thousandSeparator?: string;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  value?: number; // Controlled value
  suffix?: string;
  prefix?: string;
  onValueChange?: (value: number | undefined) => void;
  fixedDecimalScale?: boolean;
  decimalScale?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      stepper,
      thousandSeparator,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      fixedDecimalScale = false,
      decimalScale = 0,
      suffix,
      prefix,
      value: controlledValue,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null); // Create an internal ref
    const combinedRef = ref || internalRef; // Use provided ref or internal ref
    const [value, setValue] = useState<number | undefined>(
      controlledValue ?? defaultValue
    );

    const handleIncrement = useCallback(() => {
      setValue((prev) =>
        prev === undefined
          ? (stepper ?? 1)
          : Math.min(prev + (stepper ?? 1), max)
      );
    }, [stepper, max]);

    const handleDecrement = useCallback(() => {
      setValue((prev) =>
        prev === undefined
          ? -(stepper ?? 1)
          : Math.max(prev - (stepper ?? 1), min)
      );
    }, [stepper, min]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          document.activeElement ===
          (combinedRef as React.RefObject<HTMLInputElement>).current
        ) {
          if (e.key === "ArrowUp") {
            handleIncrement();
          } else if (e.key === "ArrowDown") {
            handleDecrement();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [handleIncrement, handleDecrement, combinedRef]);

    useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue);
      }
    }, [controlledValue]);

    const handleChange = (values: {
      value: string;
      floatValue: number | undefined;
    }) => {
      const newValue =
        values.floatValue === undefined ? undefined : values.floatValue;
      setValue(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
      setTimeout(() => {
        (combinedRef as React.RefObject<HTMLInputElement>).current.focus();
      }, 0);
    };

    const handleBlur = () => {
      if (value !== undefined) {
        if (value < min) {
          setValue(min);
          (ref as React.RefObject<HTMLInputElement>).current!.value =
            String(min);
        } else if (value > max) {
          setValue(max);
          (ref as React.RefObject<HTMLInputElement>).current!.value =
            String(max);
        }
      }
    };

    return (
      <div className="flex items-center">
        <NumericFormat
          value={value}
          onValueChange={handleChange}
          thousandSeparator={thousandSeparator}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={min < 0}
          valueIsNumericString
          onBlur={handleBlur}
          max={max}
          min={min}
          //suffix={suffix}
          prefix={prefix}
          customInput={(props) => (
            <Input
              {...props}
              className="w-40 text-gray-100 border-neutral-600 bg-neutral-800 rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          )}
          placeholder={placeholder}
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none relative"
          getInputRef={combinedRef} // Use combined ref
          {...props}
        />
        {suffix ? (
          <div className="flex items-center px-1 h-10 rounded-l-none rounded-md border border-l-0 border-neutral-600 bg-neutral-800 ">
            <span className="leading-none text-sm text-gray-100">{suffix}</span>
          </div>
        ) : (
          <div className="flex flex-col">
            <Button
              aria-label="Increase value"
              className="px-0 h-5 rounded-l-none rounded-br-none border-neutral-600 bg-neutral-800 border-l-0 border-b-[0.5px] focus-visible:relative hover:bg-neutral-600"
              variant="outline"
              onClick={handleIncrement}
              disabled={value === max}
            >
              <ChevronUp size={15} className="text-gray-100" />
            </Button>
            <Button
              aria-label="Decrease value"
              className="px-2 h-5 rounded-l-none rounded-tr-none border-neutral-600 bg-neutral-800 border-l-0 border-t-[0.5px] focus-visible:relative hover:bg-neutral-600"
              variant="outline"
              onClick={handleDecrement}
              disabled={value === min}
            >
              <ChevronDown size={15} className="text-gray-100" />
            </Button>
          </div>
        )}
      </div>
    );
  }
);
