import { getAcceptTypes, useUpload } from "@/hooks/use-upload";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import Dropzone from "react-dropzone";
import { Cloud, FileText, Image, Loader, Video } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { MessageContent, useMessage } from "@/hooks/use-message";

export const Upload = ({ to, socket }: { to: string; socket: WebSocket }) => {
  const { isOpen, onClose, type } = useUpload();
  const { setMessage } = useMessage();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    (
      | {
          name: string;
          url: string;
          type: string;
          size: number;
          error?: undefined;
        }
      | {
          error: string;
          name?: undefined;
          url?: undefined;
          type?: undefined;
          size?: undefined;
        }
    )[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (files.length > 0) {
      try {
        setIsLoading(true);
        const formData = new FormData();

        files.forEach((file) => {
          formData.append("data", file);
        });

        const response = await fetch(`${import.meta.env.VITE_HTTP_PROTOCOL}${import.meta.env.VITE_SERVER_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        setUploadedFiles(data.files);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sendAttachments = () => {
    if (uploadedFiles.filter((u) => u.name !== undefined).length > 0) {
      const payload: {
        to: string;
        timestamp: string;
        content: MessageContent;
      } = {
        to,
        timestamp: new Date().toISOString(),
        content: {
          type,
          data: uploadedFiles.filter((u) => u.name !== undefined),
        },
      };

      socket.send(
        JSON.stringify({
          type: "MESSAGE",
          data: payload,
        }),
      );

      setMessage(payload);
      onClose();
      setUploadedFiles([]);
      setFiles([]);
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={() => {
        onClose();
        setUploadedFiles([]);
        setFiles([]);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Upload your {type === "ANY" ? "files" : type.toLowerCase() + "s"}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="min-w-[24rem] cursor-pointer h-48 rounded-md bg-muted border border-input border-dashed gap-4">
          <Dropzone
            accept={getAcceptTypes(type)}
            onDrop={(acceptedFiles) => {
              setFiles(acceptedFiles);
            }}
          >
            {({ getRootProps, getInputProps, acceptedFiles }) => (
              <div
                {...getRootProps()}
                className="h-full w-full flex flex-col items-center justify-center gap-4"
              >
                {uploadedFiles.filter((u) => u.name !== undefined).length >
                0 ? (
                  <>
                    {(type === "ANY" || type === "PDF") && (
                      <FileText className="size-5" />
                    )}
                    {type === "IMAGE" && <Image className="size-5" />}
                    {type === "VIDEO" && <Video className="size-5" />}
                    <p className="text-muted-foreground">
                      {uploadedFiles.filter((u) => u.name !== undefined)
                        .length > 1
                        ? type === "ANY"
                          ? `${uploadedFiles.filter((u) => u.name !== undefined).length} files uploaded`
                          : `${uploadedFiles.filter((u) => u.name !== undefined).length} ${type.toLowerCase()}s uploaded`
                        : type === "ANY"
                          ? `${uploadedFiles.filter((u) => u.name !== undefined).length} file uploaded`
                          : `${uploadedFiles.filter((u) => u.name !== undefined).length} ${type.toLowerCase()} uploaded`}
                    </p>
                  </>
                ) : acceptedFiles.length > 0 ? (
                  <>
                    {(type === "ANY" || type === "PDF") && (
                      <FileText className="size-5" />
                    )}
                    {type === "IMAGE" && <Image className="size-5" />}
                    {type === "VIDEO" && <Video className="size-5" />}
                    <p className="text-muted-foreground">
                      {acceptedFiles.length > 1
                        ? type === "ANY"
                          ? `${acceptedFiles.length} files selected`
                          : `${acceptedFiles.length} ${type.toLowerCase()}s selected`
                        : type === "ANY"
                          ? `${acceptedFiles.length} file selected`
                          : `${acceptedFiles.length} ${type.toLowerCase()} selected`}
                    </p>
                  </>
                ) : (
                  <>
                    <Cloud className="size-5 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Drag 'n' drop{" "}
                      {type === "ANY" ? "files" : type.toLowerCase() + "s"} or
                      click to upload
                    </p>
                  </>
                )}
                <input {...getInputProps()} />
              </div>
            )}
          </Dropzone>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {uploadedFiles.filter((u) => u.name !== undefined).length > 0 ? (
            <Button onClick={() => sendAttachments()}>Send</Button>
          ) : (
            <Button
              className="gap-2"
              disabled={files.length === 0 || isLoading}
              onClick={() => handleUpload()}
            >
              {isLoading ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  Uploading
                </>
              ) : (
                "Upload"
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
