import { style } from "@vanilla-extract/css";

export const cell = style({
  display: "inline-flex",
  justifyContent: "space-between",
  alignItems: "center",
  height: "100%",
  fontSize: "0.9rem",
  fontWeight: 600,
  textAlign: "left",
  padding: "3px 6px",
  whiteSpace: "nowrap",
  cursor: "pointer",
  color: "var(--color)",
  backgroundColor: "var(--bg)",
  ":hover": {
    backgroundColor: "var(--hover-color)",
  },
});
