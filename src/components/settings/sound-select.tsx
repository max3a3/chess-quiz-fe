import { useAtom } from "jotai";
import { useState } from "react";
import { CheckIcon } from "lucide-react";

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
import { soundCollectionAtom } from "@/state/atoms";
import { playSound } from "@/utils/sound";
import { cn } from "@/lib/utils";

type Item = {
  label: string;
  value: string;
};

const soundCollections: Item[] = [
  { label: "Futuristic", value: "futuristic" },
  { label: "Lisp", value: "lisp" },
  { label: "NES", value: "nes" },
  { label: "Piano", value: "piano" },
  { label: "Robot", value: "robot" },
  { label: "SFX", value: "sfx" },
  { label: "Standard", value: "standard" },
  { label: "WoodLand", value: "woodland" },
];

function SelectOption({ label }: { label: string }) {
  return (
    <div className="flex items-center flex-nowrap gap-3">
      <span className="font-semibold text-sm text-primary break-all leading-tight">
        {label}
      </span>
    </div>
  );
}

const SoundSelect = () => {
  const [open, setOpen] = useState(false);
  const [soundCollection, setSoundCollection] = useAtom(soundCollectionAtom);

  const selected = soundCollections.find((p) => p.value === soundCollection);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-40 px-3"
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
            <CommandInput placeholder="Search sounds..." className="h-9" />
            <CommandList>
              <CommandEmpty>No sounds found.</CommandEmpty>
              <CommandGroup>
                {soundCollections.map((collection) => (
                  <CommandItem
                    key={collection.value}
                    value={collection.value}
                    onSelect={(currentValue) => {
                      setSoundCollection(currentValue);
                      playSound(false, false);
                      setOpen(false);
                    }}
                  >
                    <SelectOption label={collection.label} />
                    <CheckIcon
                      className={cn(
                        "ml-auto",
                        selected?.value === collection.value
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

export default SoundSelect;
