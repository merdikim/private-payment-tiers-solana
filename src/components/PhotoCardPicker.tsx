import { useCallback, useEffect, useMemo, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PhotoPickerProps } from "@/types";

export default function PhotoPicker({ onFileSelected }: PhotoPickerProps) {
  const [file, setFile] = useState<File | null>(null);

  const previewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const addFile = useCallback((fileList: FileList) => {
    const imageFile = Array.from(fileList).find((file) =>
      file.type.startsWith("image/")
    );

    if (imageFile) {
      setFile(imageFile);
      onFileSelected?.(imageFile);
    }
  }, [onFileSelected]);

  const removeFile = useCallback(() => {
    setFile(null);
    onFileSelected?.(null);
  }, [onFileSelected]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFile(event.target.files);
    event.target.value = "";
  };

  return (
      <Card className="rounded-lg p-0">
          <input
            type="file"
            accept="image/*"
            hidden
            id="photo_picker"
            onChange={handleInputChange}
          />

          <label
            htmlFor="photo_picker"
            className={`relative overflow-hidden h-60 rounded-md transition ${!file ? "cursor-pointer" : ""}`}
          >
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt={file?.name || "Selected image"}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-background/85 p-4 backdrop-blur">
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-medium">{file?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button type="button" variant="destructive" size="sm" onClick={removeFile}>
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-center">
                <div className="rounded-2xl bg-muted p-4">
                  <UploadCloud className="h-7 w-7" />
                </div>

                <h2 className="text-lg font-semibold">Pick your photo</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground px-6">
                  Drag and drop one image here, or click to browse from your device.
                </p>
              </div>
            )}
          </label>
      </Card>
  );
}
