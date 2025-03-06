import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import { Settings } from "@/components/analysis/engine-settings-form";
import {
  activeTabAtom,
  enginesAtom,
  tabEngineSettingsFamily,
} from "@/state/atoms";
import { Engine } from "@/utils/engines";
import { Button } from "@/components/ui/button";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const EngineTrigger = ({ engine }: { engine: Engine }) => {
  const activeTab = useAtomValue(activeTabAtom);
  const setEngines = useSetAtom(enginesAtom);

  const [settings, setSettings2] = useAtom(
    tabEngineSettingsFamily({
      engineName: engine.name,
      defaultSettings: engine.settings ?? undefined,
      defaultGo: engine.go ?? undefined,
      tab: activeTab!,
    })
  );

  useEffect(() => {
    if (settings.synced) {
      setSettings2((prev) => ({
        ...prev,
        go: engine.go || prev.go,
        settings: engine.settings || prev.settings,
      }));
    }
  }, [engine.settings, engine.go, settings.synced, setSettings2]);

  const setSettings = useCallback(
    (fn: (prev: Settings) => Settings) => {
      const newSettings = fn(settings);
      setSettings2(newSettings);
      if (newSettings.synced) {
        setEngines(async (prev) =>
          (await prev).map((o) =>
            o.name === engine.name
              ? { ...o, settings: newSettings.settings, go: newSettings.go }
              : o
          )
        );
      }
    },
    [engine, settings, setSettings2, setEngines]
  );

  useEffect(() => {
    //selected engine 바뀔 시 pause
    return () => {
      setSettings((prev) => ({ ...prev, enabled: false }));
    };
  }, []);

  return (
    <div>
      <Button
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
        }}
        className={cn(
          "size-9 transition-none",
          settings.enabled
            ? "bg-blue-500 hover:bg-blue-500"
            : "bg-transparent hover:bg-transparent"
        )}
      >
        {settings.enabled ? (
          <IconPlayerPause size={18} color="white" />
        ) : (
          <IconPlayerPlay size={18} color="#3B82F6" />
        )}
      </Button>
    </div>
  );
};

export default EngineTrigger;
