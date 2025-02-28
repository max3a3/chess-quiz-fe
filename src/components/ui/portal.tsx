import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  target?: HTMLElement | string;
}

export function Portal({ children, target }: PortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let targetElement: HTMLElement | null = null;

    if (typeof target === "string") {
      targetElement = document.querySelector(target);
    } else if (target instanceof HTMLElement) {
      targetElement = target;
    }

    if (!targetElement) {
      targetElement = document.createElement("div");
      document.body.appendChild(targetElement);
    }

    setContainer(targetElement);

    return () => {
      if (targetElement && targetElement.parentNode === document.body) {
        document.body.removeChild(targetElement);
      }
    };
  }, [target]);

  if (!container) return null;
  return createPortal(children, container);
}
