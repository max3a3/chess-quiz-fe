import { useAtom } from "jotai";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { boardImageAtom } from "@/state/atoms";

const boardImages: string[] = [
  "purple.svg",
  "newspaper.svg",
  "ic.svg",
  "green.svg",
  "gray.svg",
  "brown.svg",
  "blue.svg",
  "wood4.jpg",
  "wood3.jpg",
  "wood2.jpg",
  "wood.jpg",
  "purple-diag.png",
  "olive.jpg",
  "pink-pyramid.png",
  "metal.jpg",
  "marble.jpg",
  "maple2.jpg",
  "maple.jpg",
  "leather.jpg",
  "grey.jpg",
  "horsey.jpg",
  "green-plastic.png",
  "blue3.jpg",
  "canvas2.jpg",
  "blue2.jpg",
  "blue-marble.jpg",
];

function SelectOption({ label }: { label: string }) {
  let image = label;
  if (!label.endsWith(".svg")) {
    image = label.replace(".", ".thumbnail.");
  }

  return (
    <div className="flex items-center flex-nowrap gap-3">
      <div
        className="flex-shrink-0 w-16 h-8"
        style={{
          backgroundImage: `url(/board/${image})`,
          backgroundSize: label.endsWith(".svg") ? "256px" : undefined,
        }}
      />
      <span className="font-semibold text-sm text-primary break-all leading-tight">
        {label.split(".")[0]}
      </span>
    </div>
  );
}

const BoardSelect = () => {
  const [open, setOpen] = useState(false);
  const [board, setBoard] = useAtom(boardImageAtom);

  const selected = boardImages.find((p) => p === board);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-52 h-14 px-3"
          >
            {selected ? (
              <SelectOption label={selected} />
            ) : (
              <span>Pick value</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-0">
          <Command>
            <CommandInput placeholder="Search boards..." className="h-9" />
            <CommandList>
              <CommandEmpty>No boards found.</CommandEmpty>
              <CommandGroup>
                {boardImages.map((boardImage) => (
                  <CommandItem
                    key={boardImage}
                    value={boardImage}
                    onSelect={(currentValue) => {
                      setBoard(currentValue);
                      setOpen(false);
                    }}
                  >
                    <SelectOption label={boardImage} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BoardSelect;
