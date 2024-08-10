import { create } from "zustand";

export type SocketStore = {
  ws: WebSocket | null;
  setWs: (ws: WebSocket) => void;
};

export const useSocket = create<SocketStore>((set) => ({
  ws: null,
  setWs: (ws) => set({ ws }),
}));
