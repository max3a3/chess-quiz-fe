import SideBar from "@/components/side-bar";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="flex h-[100vh]">
      <SideBar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
