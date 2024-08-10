import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { useUser } from "./hooks/use-user";
import { useSocket } from "./hooks/use-socket";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { user: undefined!, socket: undefined! },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const user = useUser();
  const socket = useSocket();
  return (
    <RouterProvider router={router} context={{ user, socket }} />
  );
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
