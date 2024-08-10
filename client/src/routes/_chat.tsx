import Sidebar from "@/components/sidebar";
import { useFriends } from "@/hooks/use-friends";
import { useMessage } from "@/hooks/use-message";
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { Loader } from "lucide-react";
import { Suspense, useCallback, useEffect } from "react";

export const Route = createFileRoute("/_chat")({
  beforeLoad: ({ context }) => {
    if (!context.user.username || context.user.username.length === 0) {
      throw redirect({ to: "/" });
    }
    return context;
  },
  component: ChatLayout,
});

function ChatLayout() {
  const { user, socket } = Route.useRouteContext({
    select: ({ user, socket }) => ({ user, socket }),
  });
  const { setMessage } = useMessage();
  const { friends, setFriends } = useFriends();
  const router = useRouter();

  const handleWebSocketMessage = useCallback(
    async (event: MessageEvent) => {
      const payload = JSON.parse(event.data);
      switch (payload.type) {
        case "ID":
          user.setId(payload.data);
          await router.invalidate();
          router.navigate({ to: "/chat" });
          break;
        case "USERS":
          setFriends(payload.data);
          break;
        case "MESSAGE":
          setMessage(payload.data);
          break;
      }
    },
    [user.username],
  );

  useEffect(() => {
    (async () => {
      if (user.username) {
        const clientSocket = new WebSocket(
          `${import.meta.env.VITE_WS_PROTOCOL}${import.meta.env.VITE_SERVER_URL}?username=${user.username}`,
        );

        socket.setWs(clientSocket);
        await router.invalidate();

        clientSocket.onmessage = handleWebSocketMessage;

        return () => {
          clientSocket.close();
        };
      }
    })();
  }, [user.username, handleWebSocketMessage]);

  function Loading() {
    return (
      <div className="h-screen flex justify-content items-center">
        <Loader className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="h-screen flex">
        <Sidebar userId={user.id} username={user.username} users={friends} />
        <Outlet />
      </div>
    </Suspense>
  );
}
