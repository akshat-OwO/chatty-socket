import { SocketStore } from "@/hooks/use-socket";
import { UserStore } from "@/hooks/use-user";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import { PrimeReactProvider } from "primereact/api";

export const Route = createRootRouteWithContext<{
  user: UserStore;
  socket: SocketStore;
}>()({
  component: () => (
    <>
      <PrimeReactProvider>
        <Outlet />
      </PrimeReactProvider>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
});
