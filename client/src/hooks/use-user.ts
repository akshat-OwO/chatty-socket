import { create } from "zustand";

export type UserStore = {
  username: string;
  setUsername: (username: string) => void;
  id: string;
  setId: (id: string) => void;
};

export const useUser = create<UserStore>((set) => ({
  username: "",
  setUsername: (username) => set({ username }),
  id: "",
  setId: (id) => set({ id }),
}));
