import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <App>
      <Outlet />
    </App>
  ),
});

function App({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
