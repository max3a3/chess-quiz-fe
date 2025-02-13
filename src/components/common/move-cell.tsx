import { IconFlag } from "@tabler/icons-react";
import { useAtom } from "jotai";
import React from "react";
import tinycolor from "tinycolor2";

import { moveNotationTypeAtom } from "@/state/atoms";
import {
  ANNOTATION_INFO,
  type Annotation,
  addPieceSymbol,
} from "@/utils/annotation";
import * as classes from "@/styles/move-cell.css";

interface MoveCellProps {
  annotations: Annotation[];
  isStart: boolean;
  isCurrentVariation: boolean;
  move: string;
  onClick: () => void;
}

function MoveCell(props: MoveCellProps) {
  const [moveNotationType] = useAtom(moveNotationTypeAtom);

  const color = ANNOTATION_INFO[props.annotations[0]]?.color || "gray";

  const colorMap: { [key: string]: string } = {
    gray: "#868e96",
    cyan: "#15aabf",
    teal: "#12b886",
    lime: "#82c91e",
    yellow: "#fab005",
    orange: "#fd7e14",
    red: "#fa5252",
  };

  const hoverOpacity = props.isCurrentVariation ? 0.25 : 0.1;
  let baseLight = "#f1f3f5";
  let hoverLight = tinycolor(baseLight).setAlpha(hoverOpacity).toHex8String();
  let lightBg = "transparent";

  if (color !== "gray") {
    baseLight = colorMap[color];
    hoverLight = tinycolor(baseLight).setAlpha(hoverOpacity).toHex8String();
  }

  if (props.isCurrentVariation) {
    lightBg = tinycolor(colorMap[color]).setAlpha(0.2).toHex8String();
    hoverLight = tinycolor(lightBg).setAlpha(0.25).toHex8String();
  }

  return (
    <button
      onClick={props.onClick}
      className={classes.cell}
      style={
        {
          "--color": baseLight,
          "--bg": lightBg,
          "--hover-color": hoverLight,
        } as React.CSSProperties
      }
    >
      {props.isStart && <IconFlag style={{ marginRight: 5 }} size="0.875rem" />}
      {moveNotationType === "symbols" ? addPieceSymbol(props.move) : props.move}
      {props.annotations.join("")}
    </button>
  );
}

export default MoveCell;
