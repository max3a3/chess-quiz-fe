import { createContext, useRef } from "react";

import { type ChessStore, createChessStore } from "@/state/store";

export const ChessStateContext = createContext<ChessStore | null>(null);

const ChessStateProvider = ({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) => {
  const store = useRef(createChessStore(id)).current;

  return (
    <ChessStateContext.Provider value={store}>
      {children}
    </ChessStateContext.Provider>
  );
};

export default ChessStateProvider;
