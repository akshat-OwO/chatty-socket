import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { FormEvent, useState } from "react";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    return context;
  },
  component: Index,
});

function Index() {
  const user = Route.useRouteContext({ select: ({ user }) => user });

  const router = useRouter();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>(user.username);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (username.length > 0) {
      user.setUsername(username);
      await router.invalidate();
      navigate({ to: "/chat" });
    } else {
      setError("Username is required");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
      <Card>
        <CardHeader>
          <CardTitle>ChattySocket</CardTitle>
          <CardDescription>
            Chat application built using websockets.
          </CardDescription>
        </CardHeader>
        <CardContent className="md:min-w-[32rem]">
          <form onSubmit={handleSubmit} className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Anonymous"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {error.length > 0 && (
              <p className="p-2 border border-destructive bg-destructive/75 text-destructive-foreground rounded flex items-center gap-4">
                <AlertTriangle className="size-4" />
                {error}
              </p>
            )}
            <Button className="w-full">Join Chatrooms</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
