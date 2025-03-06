import { IconCheck, IconFlag, IconX } from "@tabler/icons-react";
import { useAtom } from "jotai";
import React from "react";
import tinycolor from "tinycolor2";
import { match } from "ts-pattern";

import { moveNotationTypeAtom } from "@/state/atoms";
import { type Annotation, getPieceSymbol } from "@/utils/annotation";
import * as classes from "@/styles/move-cell.css";
import { cn } from "@/lib/utils";
import { NodeCompletion } from "@/utils/puzzles";

interface MoveCellProps {
  annotations: Annotation[];
  isStart: boolean;
  isCurrentVariation: boolean;
  move: string;
  onClick: () => void;
  isSubline: boolean;
  completion?: NodeCompletion;
  isWhite: boolean;
}

function MoveCell(props: MoveCellProps) {
  const [moveNotationType] = useAtom(moveNotationTypeAtom);

  //const color = ANNOTATION_INFO[props.annotations[0]]?.color || "gray";

  //const colorMap: { [key: string]: string } = {
  //gray: "#868e96",
  //cyan: "#15aabf",
  //teal: "#12b886",
  //lime: "#82c91e",
  //yellow: "#fab005",
  //orange: "#fd7e14",
  //red: "#fa5252",
  //};

  //const hoverOpacity = props.isCurrentVariation ? 0.25 : 0.1;
  //let baseLight = "#f1f3f5";
  //let hoverLight = tinycolor(baseLight).setAlpha(hoverOpacity).toHex8String();
  //let lightBg = "transparent";

  //if (color !== "gray") {
  //baseLight = colorMap[color];
  //hoverLight = tinycolor(baseLight).setAlpha(hoverOpacity).toHex8String();
  //}

  //if (props.isCurrentVariation) {
  //lightBg = tinycolor(colorMap[color]).setAlpha(0.2).toHex8String();
  //hoverLight = tinycolor(lightBg).setAlpha(0.25).toHex8String();
  //}

  let lightBg = "transparent";
  let hoverLight = "#2b2b2b";

  if (props.isCurrentVariation) {
    lightBg = "#2b2b2b";
    hoverLight = tinycolor(lightBg).setAlpha(0.8).toHex8String();
  }

  return (
    <button
      onClick={props.onClick}
      className={cn(classes.cell, props.isSubline ? "w-fit" : "w-full")}
      style={
        {
          "--bg": lightBg,
          "--hover-color": hoverLight,
        } as React.CSSProperties
      }
    >
      <>
        {props.isStart && (
          <IconFlag style={{ marginRight: 5 }} size="0.875rem" />
        )}
        {moveNotationType === "symbols" ? (
          getPieceSymbol(props.move) ? (
            <span>
              <span
                className={cn(
                  "font-normal",
                  props.isWhite ? "text-white" : "text-piece-black"
                )}
              >
                {getPieceSymbol(props.move)}
              </span>
              <span>{props.move.slice(1)}</span>
            </span>
          ) : (
            props.move
          )
        ) : (
          props.move
        )}
        {props.annotations.join("")}
      </>
      {props.completion &&
        match(props.completion)
          .with("correct", () => <IconCheck color="green" size={20} />)
          .with("incorrect", () => <IconX color="red" size={20} />)
          .exhaustive()}
    </button>
  );
}

export default MoveCell;
