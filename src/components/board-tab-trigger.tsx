import { XIcon } from "lucide-react";
import { useOnClickOutside } from "usehooks-ts";
import { RefObject, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Tab } from "@/utils/tabs";

interface BoardTabTriggerProps {
  tab: Tab;
  selected: boolean;
  selectTab: (id: string) => void;
  renameTab: (id: string, title: string) => void;
  closeTab: (id: string) => void;
}

const BoardTabTrigger = ({
  tab,
  selected,
  selectTab,
  renameTab,
  closeTab,
}: BoardTabTriggerProps) => {
  const [renaming, setRenaming] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  const handleClickOutside = () => {
    ref.current?.blur();
    setRenaming(false);
  };

  const handleDoubleClick = () => {
    setRenaming(true);
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
        document.execCommand("selectAll", false); // 전체 선택 (UX 개선)
      }
    }, 0);
  };

  useOnClickOutside(ref as RefObject<HTMLElement>, handleClickOutside);

  return (
    <div
      key={tab.id}
      className={cn(
        "flex justify-between items-center gap-4 pl-3 pr-1 min-w-36 h-10 border rounded-md cursor-pointer transition-colors hover:bg-slate-100",
        selected && "bg-slate-100"
      )}
      onPointerDown={(e) => {
        if (e.button === 0) {
          selectTab(tab.id);
        }
      }}
      onDoubleClick={handleDoubleClick}
      onAuxClick={(e) => {
        if (e.button === 1) {
          closeTab(tab.id);
        }
      }}
    >
      <span
        ref={ref}
        contentEditable={renaming}
        suppressContentEditableWarning
        onBlur={(e) => {
          renameTab(tab.id, e.currentTarget.textContent || "");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className="font-medium text-sm focus:outline-none"
      >
        {tab.title}
      </span>
      <button
        onClick={() => closeTab(tab.id)}
        className="p-2 rounded-md transition-colors hover:bg-slate-200"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
};

export default BoardTabTrigger;
