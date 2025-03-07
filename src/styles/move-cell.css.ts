import { style } from "@vanilla-extract/css";

export const cell = style({
  display: "inline-flex",
  justifyContent: "space-between",
  alignItems: "center",
  height: "100%",
  textAlign: "left",
  padding: "4px 6px",
  whiteSpace: "nowrap",
  cursor: "pointer",
  color: "var(--color)",
  backgroundColor: "var(--bg)",
  borderRadius: 4,
  ":hover": {
    backgroundColor: "var(--hover-color)",
  },
});
