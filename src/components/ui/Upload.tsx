import React, { useRef, useState } from "react";
import { cn } from "@/design-system/utilities";
import Button from "./Button";

export interface UploadFile {
  uid: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "done" | "error";
  url?: string;
  thumbUrl?: string;
  percent?: number;
  error?: string;
}

export interface UploadProps {
  /** Accept file types */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxCount?: number;
  /** File list */
  fileList?: UploadFile[];
  /** Change handler */
  onChange?: (fileList: UploadFile[]) => void;
  /** Custom upload function */
  customUpload?: (file: File) => Promise<{ url: string; thumbUrl?: string }>;
  /** Enable drag and drop */
  dragDrop?: boolean;
  /** Show file list */
  showFileList?: boolean;
  /** List type */
  listType?: "text" | "picture" | "picture-card";
  /** Disabled state */
  disabled?: boolean;
  /** Helper text */
  helperText?: string;
  /** Validation state */
  state?: "default" | "error";
  /** Custom class */
  className?: string;
}

const Upload: React.FC<UploadProps> = ({
  accept,
  multiple = false,
  maxSize,
  maxCount,
  fileList = [],
  onChange,
  customUpload,
  dragDrop = true,
  showFileList = true,
  listType = "text",
  disabled = false,
  helperText,
  state = "default",
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID
  const generateUID = () =>
    `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Validate file
  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File quá lớn. Kích thước tối đa: ${(
        maxSize /
        1024 /
        1024
      ).toFixed(2)}MB`;
    }
    if (maxCount && fileList.length >= maxCount) {
      return `Đã đạt giới hạn ${maxCount} file`;
    }
    return null;
  };

  // Handle file upload
  const handleUpload = async (files: File[]) => {
    if (disabled) return;

    const newFiles: UploadFile[] = [];

    for (const file of files) {
      const error = validateFile(file);
      const uid = generateUID();

      const uploadFile: UploadFile = {
        uid,
        name: file.name,
        size: file.size,
        type: file.type,
        status: error ? "error" : "uploading",
        percent: 0,
        error,
      };

      newFiles.push(uploadFile);

      // Generate preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const updatedFiles = fileList.map((f) =>
            f.uid === uid ? { ...f, thumbUrl: e.target?.result as string } : f
          );
          onChange?.(updatedFiles);
        };
        reader.readAsDataURL(file);
      }

      // Upload file
      if (!error) {
        if (customUpload) {
          try {
            const result = await customUpload(file);
            const updatedFiles = fileList.map((f) =>
              f.uid === uid
                ? {
                    ...f,
                    status: "done" as const,
                    percent: 100,
                    url: result.url,
                    thumbUrl: result.thumbUrl,
                  }
                : f
            );
            onChange?.(updatedFiles);
          } catch (err) {
            const updatedFiles = fileList.map((f) =>
              f.uid === uid
                ? { ...f, status: "error" as const, error: "Upload failed" }
                : f
            );
            onChange?.(updatedFiles);
          }
        } else {
          // Default: mark as done immediately
          const updatedFiles = fileList.map((f) =>
            f.uid === uid ? { ...f, status: "done" as const, percent: 100 } : f
          );
          onChange?.(updatedFiles);
        }
      }
    }

    onChange?.([...fileList, ...newFiles]);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleUpload(files);
    }
    // Reset input value to allow uploading same file again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files);
    }
  };

  // Handle remove file
  const handleRemove = (uid: string) => {
    const updatedFiles = fileList.filter((f) => f.uid !== uid);
    onChange?.(updatedFiles);
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Upload area component
  const UploadArea = () => (
    <div
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer",
        "flex flex-col items-center justify-center gap-3 p-8",
        isDragging && "border-primary-500 bg-primary-50",
        !isDragging &&
          state === "default" &&
          "border-neutral-300 hover:border-primary-500 hover:bg-neutral-50",
        !isDragging && state === "error" && "border-error-500 bg-error-50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-neutral-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-neutral-900">
          {dragDrop ? "Kéo thả file vào đây hoặc" : "Chọn file để upload"}
        </p>
        {dragDrop && (
          <Button variant="link" size="sm" className="mt-1">
            chọn từ máy tính
          </Button>
        )}
      </div>

      {(maxSize || accept) && (
        <p className="text-xs text-neutral-500">
          {accept && `Định dạng: ${accept}`}
          {maxSize && ` • Tối đa: ${(maxSize / 1024 / 1024).toFixed(0)}MB`}
        </p>
      )}
    </div>
  );

  // File list component
  const FileList = () => {
    if (!showFileList || fileList.length === 0) return null;

    if (listType === "picture-card") {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {fileList.map((file) => (
            <div
              key={file.uid}
              className="relative aspect-square border-2 border-neutral-200 rounded-lg overflow-hidden group"
            >
              {file.thumbUrl ? (
                <img
                  src={file.thumbUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={() => handleRemove(file.uid)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-full hover:bg-neutral-100"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Status */}
              {file.status === "uploading" && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
                </div>
              )}
              {file.status === "error" && (
                <div className="absolute inset-0 bg-error-500 bg-opacity-10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-error-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-2">
        {fileList.map((file) => (
          <div
            key={file.uid}
            className={cn(
              "flex items-center gap-3 p-3 border rounded-lg transition-colors",
              file.status === "error" && "border-error-200 bg-error-50",
              file.status !== "error" &&
                "border-neutral-200 bg-white hover:bg-neutral-50"
            )}
          >
            {/* Icon/Thumbnail */}
            {listType === "picture" && file.thumbUrl ? (
              <img
                src={file.thumbUrl}
                alt={file.name}
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <div className="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-neutral-500">
                {formatSize(file.size)}
              </p>
              {file.status === "uploading" && file.percent !== undefined && (
                <div className="mt-1 w-full bg-neutral-200 rounded-full h-1">
                  <div
                    className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${file.percent}%` }}
                  />
                </div>
              )}
              {file.status === "error" && file.error && (
                <p className="text-xs text-error-500 mt-1">{file.error}</p>
              )}
            </div>

            {/* Actions */}
            <button
              onClick={() => handleRemove(file.uid)}
              className="p-1 hover:bg-neutral-200 rounded transition-colors flex-shrink-0"
            >
              <svg
                className="w-4 h-4 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <UploadArea />
      <FileList />

      {helperText && (
        <p
          className={cn(
            "mt-2 text-sm",
            state === "error" ? "text-error-500" : "text-neutral-500"
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Upload;
