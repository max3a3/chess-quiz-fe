import { Helmet } from "react-helmet";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useAtomValue } from "jotai";

import { pieceSetAtom } from "@/state/atoms";

import { routeTree } from "./routeTree.gen";

import "@/styles/chessground.css";
import "@/styles/chessground-base-override.css";
import "@/styles/chessground-colors-override.css";
import "@/styles/index.css";

const router = createRouter({ routeTree, trailingSlash: "never" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const pieceSet = useAtomValue(pieceSetAtom);

  return (
    <>
      <Helmet>
        <link rel="stylesheet" href={`/pieces/${pieceSet}.css`} />
      </Helmet>
      <RouterProvider router={router} />
    </>
  );
}
