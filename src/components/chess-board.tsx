import { useEffect, useRef, useState } from "react";
import { Chessground } from "chessground";
import { Api } from "chessground/api";
import { Config } from "chessground/config";

const ChessBoard = (props: Config) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<Api | null>(null);

  useEffect(() => {
    if (boardRef.current === null) return;
    if (api) {
      api.set({
        ...props,
      });
    } else {
      const chessgroundApi = Chessground(boardRef.current, {
        ...props,
        addDimensionsCssVarsTo: boardRef.current,
      });
      setApi(chessgroundApi);
    }
  }, [api, props]);

  return (
    <div className="flex items-center gap-4 ">
      <div
        ref={boardRef}
        style={{
          width: "600px",
          height: "600px",

          //TODO: 동적 체스보드 배경이미지 설정
          backgroundImage: "url(/board/wood4.jpg)",
        }}
        className="bg-center bg-cover rounded-md"
      />
    </div>
  );
};

export default ChessBoard;
