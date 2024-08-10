import { MessageProps } from "@/hooks/use-message";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  ArrowDownToLine,
  FileText,
  ImageIcon,
  User,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Image } from "primereact/image";
import ReactPlayer from "react-player";

export const Message = ({
  message,
  c,
  userId,
}: {
  message: MessageProps;
  c: string;
  userId: string;
}) => {
  const handleUrl = () => {
    const urlRegex =
      /https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/;

    const updatedContent = (message.content.data as string).replace(
      urlRegex,
      (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-800 underline">${url}</a>`;
      },
    );

    return updatedContent;
  };

  return (
    <div
      className={cn("flex items-end gap-4", {
        "flex-row-reverse": message.to,
      })}
    >
      <Avatar className="bg-secondary">
        <AvatarImage
          src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${message.to ? userId : c}`}
        />
        <AvatarFallback>
          <User className="size-10" />
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex-1 relative pb-2 shadow bg-secondary text-secondary-foreground rounded-md flex flex-col max-w-xs",
          {
            "rounded-bl-none": message.from,
            "rounded-br-none bg-primary text-primary-foreground": message.to,
          },
        )}
      >
        {message.content.type === "TEXT" ||
        message.content.type === "TEXTWITHURL" ? (
          <p
            dangerouslySetInnerHTML={{ __html: handleUrl() }}
            className="text-sm px-4 py-2"
          />
        ) : null}
        {(message.content.type === "ANY" || message.content.type === "PDF") && (
          <div className="p-4 pb-2 flex flex-col gap-2">
            {message.content.data.map((file) => (
              <a
                key={file.url}
                href={file.url}
                target="_blank"
                className="group flex items-center gap-2"
              >
                <div className="size-10 bg-background rounded-md flex items-center justify-center text-primary">
                  {file.type.includes("image") ? (
                    <ImageIcon className="size-4 group-hover:hidden" />
                  ) : file.type.includes("video") ? (
                    <Video className="size-4 group-hover:hidden" />
                  ) : (
                    <FileText className="size-4 group-hover:hidden" />
                  )}
                  <ArrowDownToLine className="size-4 hidden group-hover:block" />
                </div>
                <div className="flex-1 flex flex-col">
                  <p className="text-sm line-clamp-1">{file.name}</p>
                  <p className="text-xs">
                    {(file.size / (1024 * 1024)).toFixed(2)}mb
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
        {message.content.type === "IMAGE" && (
          <div className="p-4 flex flex-wrap gap-0.5">
            {message.content.data.map((file) => (
              <Image
                key={file.url}
                src={file.url}
                alt={file.name}
                preview
                imageClassName="object-cover h-full w-full"
                className="object-cover flex-1"
              />
            ))}
          </div>
        )}
        {message.content.type === "VIDEO" && (
          <div className="p-4 flex flex-col gap-1">
            {message.content.data.map((file) => (
              <div key={file.url} className="aspect-video">
                <ReactPlayer
                  controls
                  playsinline
                  url={file.url}
                  height="100%"
                  width="100%"
                />
              </div>
            ))}
          </div>
        )}
        <span
          className={cn(
            "absolute bottom-2 right-2 text-xs text-muted-foreground",
            {
              "text-neutral-50/90": message.to,
            },
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Kolkata",
          })}
        </span>
        {message.content.type === "TEXTWITHURL" && message.content.ogData && (
          <div
            className={cn(
              "p-2 border-t border-t-input text-secondary-foreground flex items-center gap-2",
              {
                "bg-primary text-primary-foreground": message.to,
                "bg-secondary": message.from,
              },
            )}
          >
            <>
              <div className="rounded-md">
                {message.content.ogData["og:image"] && (
                  <img
                    src={message.content.ogData["og:image"]}
                    alt={message.content.ogData["og:title"]}
                    className="w-16 object-contain rounded-md"
                  />
                )}
              </div>
              <div className="flex-1 flex-col gap-2">
                <p className="text-sm font-semibold">
                  {message.content.ogData["og:title"]}
                </p>
                <p className="text-xs line-clamp-2">
                  {message.content.ogData["og:description"]}
                </p>
                <a
                  href={message.content.ogData["og:url"]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-800 underline"
                >
                  {message.content.ogData["og:url"]}
                </a>
              </div>
            </>
          </div>
        )}
      </div>
    </div>
  );
};
