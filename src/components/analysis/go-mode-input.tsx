import { match } from "ts-pattern";

import { NumberInput } from "@/components/ui/number-input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoMode } from "@/utils/engines";

const GoModeInput = ({
  goMode,
  setGoMode,
}: {
  goMode: GoMode | null;
  setGoMode: (v: GoMode) => void;
}) => {
  const types = ["Time", "Depth", "Nodes", "Infinite"];

  return (
    <div className="flex gap-2">
      <Tabs
        value={goMode?.t || "Infinite"}
        onValueChange={(v) => {
          const newGo = match<string | null, GoMode>(v)
            .with("Depth", () => ({ t: "Depth", c: 20 }))
            .with("Nodes", () => ({ t: "Nodes", c: 1000000 }))
            .with("Time", () => ({ t: "Time", c: 8000 }))
            .otherwise(() => ({ t: "Infinite" }));

          setGoMode(newGo);
        }}
      >
        <TabsList className="bg-main-button">
          {types.map((type) => (
            <TabsTrigger
              key={type}
              value={type}
              className="p-1.5 text-white/70 data-[state=active]:bg-main-box data-[state=active]:text-white hover:text-white"
            >
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {match(goMode || { t: "Infinite" })
        .with({ t: "Depth" }, (v) => (
          <NumberInput
            min={1}
            value={v.c}
            onValueChange={(v) =>
              setGoMode({ t: "Depth", c: typeof v === "number" ? v : 1 })
            }
          />
        ))
        .with({ t: "Nodes" }, (v) => (
          <NumberInput
            min={1}
            value={v.c}
            onValueChange={(v) =>
              setGoMode({ t: "Nodes", c: typeof v === "number" ? v : 1 })
            }
          />
        ))
        .with({ t: "Time" }, (v) => (
          <NumberInput
            min={1}
            value={v.c}
            suffix="ms"
            onValueChange={(v) =>
              setGoMode({ t: "Time", c: typeof v === "number" ? v : 1 })
            }
          />
        ))
        .otherwise(() => null)}
    </div>
  );
};

export default GoModeInput;
