import { create } from "zustand";

type FriendStore = {
  friends: { id: string; username: string }[];
  setFriends: (friends: { id: string; username: string }[]) => void;
};

export const useFriends = create<FriendStore>((set) => ({
  friends: [],
  setFriends: (friends) => set({ friends }),
}));
