import { Accept } from "react-dropzone";
import { create } from "zustand";

type UploadStore = {
  type: "ANY" | "IMAGE" | "VIDEO" | "PDF";
  isOpen: boolean;
  onOpen: (type: UploadStore["type"]) => void;
  onClose: () => void;
};

export const useUpload = create<UploadStore>((set) => ({
  type: "ANY",
  isOpen: false,
  onOpen: (type) => set({ isOpen: true, type }),
  onClose: () => set({ isOpen: false }),
}));

export const getAcceptTypes = (
  type: "ANY" | "IMAGE" | "VIDEO" | "PDF",
): Accept => {
  switch (type) {
    case "IMAGE":
      return {
        "image/*": ["image/png", "image/jpeg", "image/gif"],
      };
    case "VIDEO":
      return {
        "video/*": ["video/mp4", "video/ogg", "video/webm"],
      };
    case "PDF":
      return {
        "application/pdf": ["application/pdf"],
      };
    case "ANY":
    default:
      return {
        "*/*": ["*/*"],
      };
  }
};
