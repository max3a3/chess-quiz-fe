import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import Helmet from "react-helmet";

import "@/styles/chessground.css";
import "@/styles/chessground-base-override.css";
import "@/styles/chessground-colors-override.css";
import "@/styles/index.css";

import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree, trailingSlash: "never" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <>
    <Helmet>
      {
        //TODO: 체스말 동적 스타일링
      }
      <link rel="stylesheet" href="/pieces/tatiana.css" />
    </Helmet>
    <RouterProvider router={router} />
  </>
);
