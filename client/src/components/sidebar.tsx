import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { buttonVariants } from "./ui/button";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";
import { useSidebar } from "@/hooks/use-sidebar";
import { ScrollArea } from "./ui/scroll-area";

interface SidebarProps {
  userId: string;
  username: string;
  users: {
    id: string;
    username: string;
  }[];
}

const Sidebar = ({ userId, username, users }: SidebarProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isOpen, onClose } = useSidebar();

  return (
    <aside
      className={cn(
        "border-r overflow-hidden transition-all duration-500 h-screen flex flex-col justify-between gap-4",
        {
          "w-0 p-0": isMobile && !isOpen,
          "w-screen p-2": isMobile && isOpen,
          "w-80 p-2": !isMobile,
        },
      )}
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl py-2 text-center font-semibold">
          ChattySocket
        </h1>
        <div className="py-5 border-y flex-1 flex flex-col gap-2">
          <h2 className="flex items-center gap-3 font-semibold">
            <div
              className={cn("rounded-full animate-pulse bg-green-500 size-3", {
                "bg-red-500": users.length - 1 === 0,
              })}
            />
            <div className="flex-1 flex items-center justify-between">
              <span>Online Users</span>{" "}
              <span className="bg-secondary rounded-full px-3 py-1">
                {users.length - 1}
              </span>
            </div>
          </h2>
          <ScrollArea className="max-h-[calc(100vh-15rem)]">
            <div className="h-full flex flex-col gap-2">
              {users.length - 1 === 0 && (
                <p className="text-center py-2 text-sm text-gray-500">
                  No users online
                </p>
              )}
              {users
                .filter((u) => u.id !== userId)
                .map((u) => (
                  <Link
                    key={u.id}
                    to="/chat"
                    search={{ c: u.id, u: u.username }}
                    onClick={() => onClose()}
                    className={cn(
                      buttonVariants({
                        variant: "outline",
                        className: "h-fit justify-start gap-4",
                      }),
                    )}
                  >
                    <Avatar className="bg-secondary">
                      <AvatarImage
                        src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${u.id}`}
                      />
                      <AvatarFallback>
                        <User className="size-10" />
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold">{u.username}</p>
                  </Link>
                ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="p-2 border border-input rounded flex items-center gap-4">
        <Avatar className="bg-secondary">
          <AvatarImage
            src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${userId}`}
          />
          <AvatarFallback>
            <User className="size-10" />
          </AvatarFallback>
        </Avatar>
        <p className="text-sm font-semibold">{username}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
