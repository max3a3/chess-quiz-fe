import { useCallback } from "react";

import HashSlider from "@/components/analysis/hash-slider";
import SettingSlider from "@/components/analysis/setting-slider";
import { type EngineSettings, type GoMode } from "@/utils/engines";
import GoModeInput from "@/components/analysis/go-mode-input";

export type Settings = {
  enabled: boolean;
  go: GoMode;
  settings: EngineSettings;
  synced: boolean;
};

interface EngineSettingsForm {
  settings: Settings;
  setSettings: (fn: (prev: Settings) => Settings) => void;
}

const EngineSettingsForm = ({ settings, setSettings }: EngineSettingsForm) => {
  const multipv = settings.settings.find((o) => o.name === "MultiPV");
  const threads = settings.settings.find((o) => o.name === "Threads");
  const hash = settings.settings.find((o) => o.name === "Hash");

  const setGoMode = useCallback(
    (v: GoMode) => {
      setSettings((prev) => ({
        ...prev,
        go: v,
      }));
    },
    [setSettings]
  );

  return (
    <div className="space-y-3 p-3 pt-0">
      <GoModeInput goMode={settings.go} setGoMode={setGoMode} />
      {multipv && (
        <div className="flex items-center gap-2">
          <span className="flex-1 text-white text-sm">Number of lines</span>
          <div className="flex items-center gap-2 flex-1">
            <SettingSlider
              value={Number(multipv.value || 1)}
              setValue={(v) =>
                setSettings((prev) => {
                  return {
                    ...prev,
                    settings: prev.settings.map((o) =>
                      o.name === "MultiPV" ? { ...o, value: v || 1 } : o
                    ),
                  };
                })
              }
              max={5}
            />
            <span className="inline-block w-16 text-right text-white text-sm">
              {multipv.value}/5
            </span>
          </div>
        </div>
      )}
      {threads && (
        <>
          <div className="flex items-center gap-2">
            <span className="flex-1 text-white text-sm">Number of cores</span>
            <div className="flex items-center gap-2 flex-1">
              <SettingSlider
                value={Number(threads.value || 1)}
                setValue={(v) =>
                  setSettings((prev) => {
                    return {
                      ...prev,
                      settings: prev.settings.map((o) =>
                        o.name === "Threads" ? { ...o, value: v || 1 } : o
                      ),
                    };
                  })
                }
                max={32}
              />
              <span className="inline-block w-16 text-right text-white text-sm">
                {threads.value}/32
              </span>
            </div>
          </div>
          {hash && (
            <div className="flex items-center gap-2">
              <span className="flex-1 text-white text-sm">Size of hash</span>
              <div className="flex items-center gap-2 flex-1">
                <HashSlider
                  value={Number(hash.value || 1)}
                  setValue={(v) =>
                    setSettings((prev) => {
                      return {
                        ...prev,
                        settings: prev.settings.map((o) =>
                          o.name === "Hash" ? { ...o, value: v || 1 } : o
                        ),
                      };
                    })
                  }
                />
                <span className="inline-block w-16 text-right text-white text-sm">
                  {hash.value}/512
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EngineSettingsForm;
