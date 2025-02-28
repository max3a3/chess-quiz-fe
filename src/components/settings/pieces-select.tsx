import { useAtom } from "jotai";
import { CheckIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { pieceSetAtom } from "@/state/atoms";
import PieceComponent from "@/components/common/piece";

type Item = {
  label: string;
  value: string;
};

const pieceSets: Item[] = [
  { label: "Alpha", value: "alpha" },
  { label: "Anarcandy", value: "anarcandy" },
  { label: "California", value: "california" },
  { label: "Cardinal", value: "cardinal" },
  { label: "Cburnett", value: "cburnett" },
  { label: "Chess7", value: "chess7" },
  { label: "Chessnut", value: "chessnut" },
  { label: "Companion", value: "companion" },
  { label: "Disguised", value: "disguised" },
  { label: "Dubrovny", value: "dubrovny" },
  { label: "Fantasy", value: "fantasy" },
  { label: "Fresca", value: "fresca" },
  { label: "Gioco", value: "gioco" },
  { label: "Governor", value: "governor" },
  { label: "Horsey", value: "horsey" },
  { label: "ICpieces", value: "icpieces" },
  { label: "Kosal", value: "kosal" },
  { label: "Leipzig", value: "leipzig" },
  { label: "Letter", value: "letter" },
  { label: "Libra", value: "libra" },
  { label: "Maestro", value: "maestro" },
  { label: "Merida", value: "merida" },
  { label: "Pirouetti", value: "pirouetti" },
  { label: "Pixel", value: "pixel" },
  { label: "Reillycraig", value: "reillycraig" },
  { label: "Riohacha", value: "riohacha" },
  { label: "Shapes", value: "shapes" },
  { label: "Spatial", value: "spatial" },
  { label: "Staunty", value: "staunty" },
  { label: "Tatiana", value: "tatiana" },
];

function SelectOption({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-10">
        <PieceComponent piece={{ color: "white", role: "knight" }} />
      </div>
      <span className="font-semibold text-sm text-primary">{label}</span>
    </div>
  );
}

const PiecesSelect = () => {
  const [open, setOpen] = useState(false);
  const [pieceSet, setPieceSet] = useAtom(pieceSetAtom);

  const selected = pieceSets.find((p) => p.value === pieceSet);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-40 h-14 px-3"
          >
            {selected ? (
              <SelectOption label={selected.label} />
            ) : (
              <span>Pick value</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-0">
          <Command>
            <CommandInput placeholder="Search pieces..." className="h-9" />
            <CommandList>
              <CommandEmpty>No pieces found.</CommandEmpty>
              <CommandGroup>
                {pieceSets.map((pieceSet) => (
                  <CommandItem
                    key={pieceSet.value}
                    value={pieceSet.value}
                    onSelect={(currentValue) => {
                      setPieceSet(currentValue);
                      setOpen(false);
                    }}
                    className="font-semibold text-sm text-primary"
                  >
                    {pieceSet.label}
                    <CheckIcon
                      className={cn(
                        "ml-auto",
                        selected?.value === pieceSet.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
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

export default PiecesSelect;
