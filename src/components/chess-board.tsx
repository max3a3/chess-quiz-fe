import { useEffect, useRef, useState } from "react";
import { Chessground } from "chessground";
import { Api } from "chessground/api";
import { Config } from "chessground/config";
import { SquareName } from "chessops";
import { useAtomValue } from "jotai";
import { boardImageAtom } from "@/state/atoms";

const ChessBoard = (
  props: Config & {
    setBoardFen?: (fen: string) => void;
    hintSelected?: SquareName | null;
  }
) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<Api | null>(null);

  useEffect(() => {
    if (boardRef?.current === null) return;
    if (api) {
      api.set({
        ...props,
        events: {
          change: () => {
            if (props.setBoardFen && api) {
              props.setBoardFen(api.getFen());
            }
          },
        },
      });
    } else {
      const chessgroundApi = Chessground(boardRef.current, {
        ...props,
        addDimensionsCssVarsTo: boardRef.current,
        events: {
          change: () => {
            if (props.setBoardFen && api) {
              props.setBoardFen(chessgroundApi.getFen());
            }
          },
        },
      });
      setApi(chessgroundApi);
    }
  }, [api, props, boardRef]);

  useEffect(() => {
    if (!api || props.hintSelected === undefined) return;
    api.selectSquare(props.hintSelected);
  }, [api, props.hintSelected]);

  const boardImage = useAtomValue(boardImageAtom);

  return (
    <div
      ref={boardRef}
      style={{
        backgroundImage: `url(/board/${boardImage})`,
      }}
      className="aspect-square w-full bg-center bg-cover rounded-md"
    />
  );
};

export default ChessBoard;
