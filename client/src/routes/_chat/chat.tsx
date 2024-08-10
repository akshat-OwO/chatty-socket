import { Message } from "@/components/message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageContent, useMessage } from "@/hooks/use-message";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronsLeft,
  FileText,
  Image,
  MessageCircle,
  Paperclip,
  Plus,
  SendHorizonal,
  Smile,
  User,
  Video,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback, useMediaQuery } from "@mantine/hooks";
import { OpenGraphData } from "@/schemas/og";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useFriends } from "@/hooks/use-friends";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUpload } from "@/hooks/use-upload";
import { Upload } from "@/components/upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/hooks/use-sidebar";

export const Route = createFileRoute("/_chat/chat")({
  validateSearch: (
    search: Record<string, string>,
  ): { c?: string; u?: string } => {
    return {
      c: search.c,
      u: search.u,
    };
  },
  beforeLoad: ({ context }) => {
    return context;
  },
  component: Chat,
});

function Chat() {
  const { user, socket } = Route.useRouteContext({
    select: ({ user, socket }) => ({ user, socket }),
  });

  const { messages, setMessage } = useMessage();
  const { friends } = useFriends();
  const { onOpen, onClose } = useUpload();
  const { onOpen: onSidebarOpen, isOpen: isSidebarOpen } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [input, setInput] = useState<string>("");
  const [messageType, setMessageType] = useState<"TEXT" | "TEXTWITHURL">(
    "TEXT",
  );
  const [hasUrl, setHasUrl] = useState<boolean>(false);
  const [fetchingUrl, setFetchingUrl] = useState<boolean>(false);
  const [ogData, setOgData] = useState<OpenGraphData>();

  const { c, u } = Route.useSearch();
  const navigate = Route.useNavigate();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (c && u) {
      const friend = friends.find((f) => f.id === c);
      if (!friend) {
        navigate({ to: "/chat" });
        onClose();
      }
    }
  }, [c, u, friends]);

  const fetchUrl = useDebouncedCallback(
    useCallback(async (value: string) => {
      const urlRegex =
        /https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/;

      const url = value.match(urlRegex);
      if (url) {
        setHasUrl(true);
        setMessageType("TEXTWITHURL");
        try {
          setFetchingUrl(true);
          const response = await fetch(
            `${import.meta.env.VITE_HTTP_PROTOCOL}${import.meta.env.VITE_SERVER_URL}/fetch-og?url=${url[0]}`,
          );
          const data = await response.json();
          setOgData(data);
        } catch (error) {
          console.log(error);
        } finally {
          setFetchingUrl(false);
        }
      } else {
        setMessageType("TEXT");
        setHasUrl(false);
        setOgData(undefined);
      }
    }, []),
    500,
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (socket.ws instanceof WebSocket && input.trim().length > 0) {
      const payload: {
        to?: string;
        timestamp: string;
        content: MessageContent;
      } = {
        to: c,
        timestamp: new Date().toISOString(),
        content: {
          type: messageType,
          data: input.trim(),
        },
      };

      if (messageType === "TEXTWITHURL" && hasUrl) {
        (
          payload.content as { type: "TEXTWITHURL"; ogData?: OpenGraphData }
        ).ogData = ogData;
      }

      socket.ws.send(
        JSON.stringify({
          type: "MESSAGE",
          data: payload,
        }),
      );
      setInput("");
      setOgData(undefined);
      setMessage(payload);
    }
  };

  if (!(socket.ws instanceof WebSocket) || !c || !u) {
    return (
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 flex-1 flex flex-col items-center justify-center",
          {
            "w-0": isSidebarOpen,
          },
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="p-4 bg-primary text-primary-foreground">
              <MessageCircle className="size-full" />
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold">Start a chat with someone</h3>
          {isMobile && (
            <Button className="gap-2" onClick={() => onSidebarOpen()}>
              <ChevronsLeft className="size-4" />
              Look whose online
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-500 pb-4 flex-1 flex flex-col",
        {
          "w-0": isSidebarOpen,
        },
      )}
    >
      <nav className="border-b border-input p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => onSidebarOpen()}>
              <ChevronsLeft className="size-4" />
            </Button>
          )}
          <Avatar className="bg-secondary">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${c}`}
            />
            <AvatarFallback>
              <User className="size-10" />
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-semibold">{u}</p>
        </div>
      </nav>

      <ScrollArea className="flex-1">
        <div className="p-5 h-full flex flex-col gap-4">
          {messages
            .filter((m) => (m.from === c && !m.to) || m.to === c)
            .map((message) => (
              <Message
                key={message.timestamp}
                message={message}
                c={c}
                userId={user.id}
              />
            ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div
        className={cn(
          "mb-1 p-0 max-h-0 border-t border-t-input shadow bg-secondary transition-all duration-500 overflow-hidden flex gap-2 items-center",
          {
            "animate-pulse bg-muted min-h-[8rem]": fetchingUrl,
            "p-2 pb-4 max-h-32": ogData,
          },
        )}
      >
        {ogData && !fetchingUrl && (
          <>
            <div className="rounded-md">
              {ogData["og:image"] && (
                <img
                  src={ogData["og:image"]}
                  alt={ogData["og:title"]}
                  className="w-48 object-contain rounded-md"
                />
              )}
            </div>
            <div className="flex-1 flex-col gap-2">
              <p className="text-sm font-semibold">{ogData["og:title"]}</p>
              <p className="text-xs line-clamp-2">{ogData["og:description"]}</p>
              <a
                href={ogData["og:url"]}
                target="_blank"
                rel="noreferrer"
                className="text-xs underline"
              >
                {ogData["og:url"]}
              </a>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOgData(undefined)}
            >
              <X className="size-4" />
            </Button>
          </>
        )}
      </div>
      <div className="px-2 flex items-start gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Smile className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit" align="start" side="top">
            <EmojiPicker
              lazyLoadEmojis
              onEmojiClick={(emojiData) =>
                setInput((prev) => prev + emojiData.emoji)
              }
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Paperclip className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="max-w-xs" align="start" side="top">
            <div className="flex flex-wrap justify-around gap-4">
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpen("ANY")}
                >
                  <Plus className="size-4" />
                </Button>
                <span className="text-center font-semibold text-xs text-muted-foreground">
                  Add file
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpen("IMAGE")}
                >
                  <Image className="size-4" />
                </Button>
                <span className="text-center font-semibold text-xs text-muted-foreground">
                  Image
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpen("PDF")}
                >
                  <FileText className="size-4" />
                </Button>
                <span className="text-center font-semibold text-xs text-muted-foreground">
                  PDF
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpen("VIDEO")}
                >
                  <Video className="size-4" />
                </Button>
                <span className="text-center font-semibold text-xs text-muted-foreground">
                  Video
                </span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Upload to={c} socket={socket.ws} />
        <form onSubmit={onSubmit} className="flex-1 flex items-start gap-2">
          <Textarea
            maxRows={3}
            value={input}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                onSubmit(e);
              }
            }}
            onChange={(e) => {
              setInput(e.target.value);
              fetchUrl(e.target.value);
            }}
            placeholder="Enter your message..."
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button variant="ghost" size="icon" type="submit">
            <SendHorizonal className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
