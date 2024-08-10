import { OpenGraphData } from "@/schemas/og";
import { create } from "zustand";

interface TextContent {
  type: "TEXT";
  data: string;
}

interface TextWithUrlContent {
  type: "TEXTWITHURL";
  data: string;
  ogData?: OpenGraphData;
}

type Attachment = {
  name: string;
  url: string;
  type: string;
  size: number;
  error?: undefined;
}[];

interface AnyContent {
  type: "ANY";
  data: Attachment;
}

interface ImageContent {
  type: "IMAGE";
  data: Attachment;
}

interface VideoContent {
  type: "VIDEO";
  data: Attachment;
}

interface PDFContent {
  type: "PDF";
  data: Attachment;
}

export type MessageContent =
  | TextContent
  | TextWithUrlContent
  | AnyContent
  | ImageContent
  | VideoContent
  | PDFContent;

export interface MessageProps {
  timestamp: string;
  content: MessageContent;
  to?: string;
  from?: string;
}

export type MessageStore = {
  messages: MessageProps[];
  setMessage: (message: MessageProps) => void;
};

export const useMessage = create<MessageStore>((set) => ({
  messages: [],
  setMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));
