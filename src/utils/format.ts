export function formatNodes(nodes: number) {
  if (nodes < 1000) return nodes.toFixed(0);
  return `${(nodes / 1000).toFixed(0)}k`;
}

export function formatMove(orientation: string) {
  return orientation === "w" ? "white" : "black";
}
