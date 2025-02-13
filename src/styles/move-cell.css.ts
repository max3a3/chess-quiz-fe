import { style } from "@vanilla-extract/css";

export const cell = style({
  all: "unset",
  fontSize: "0.9rem",
  fontWeight: 600,
  display: "inline-block",
  padding: 6,
  borderRadius: 4,
  whiteSpace: "nowrap",
  cursor: "pointer",
  color: "var(--color)",
  backgroundColor: "var(--bg)",
  ":hover": {
    backgroundColor: "var(--hover-color)",
  },
});
