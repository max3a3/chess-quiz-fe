import { useEffect } from "react";

export function isPrefix<T>(shorter: T[], longer: T[]): boolean {
  if (shorter.length > longer.length) {
    return false;
  }
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] !== longer[i]) {
      return false;
    }
  }
  return true;
}

export const useThrottledEffect = (
  callback: () => void,
  delay: number,
  deps: React.DependencyList
) => {
  useEffect(() => {
    const handler = setTimeout(() => callback(), delay);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay]);
};
