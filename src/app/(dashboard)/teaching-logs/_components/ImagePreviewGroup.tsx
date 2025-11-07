import React, { useState } from "react";
import { Modal, Image as AntImage } from "antd";
import Image from "next/image";
import { EyeOutlined } from "@ant-design/icons";

const ImagePreviewGroup: React.FC<{ images: string[] }> = ({ images }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  if (!images || images.length === 0) {
    return (
      <span style={{ color: "#999", fontStyle: "italic" }}>Không có ảnh</span>
    );
  }

  const handlePreview = (src: string, idx: number) => {
    setPreview(src);
    setPreviewIndex(idx);
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: 12,
          maxWidth: 600,
        }}
      >
        {images.map((img, idx) => {
          // Check if img is a URL (from ImgBB) or base64
          const isUrl = img.startsWith("http://") || img.startsWith("https://");
          const src = isUrl ? img : `data:image/jpeg;base64,${img}`;

          return (
            <div
              key={idx}
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "100%", // 1:1 aspect ratio
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid #d9d9d9",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.06)";
              }}
              onClick={() => handlePreview(src, idx)}
            >
              <Image
                src={src}
                alt={`Ảnh ${idx + 1}`}
                fill
                unoptimized
                style={{
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.4)";
                  const icon = e.currentTarget.querySelector(
                    ".preview-icon"
                  ) as HTMLElement;
                  if (icon) icon.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0)";
                  const icon = e.currentTarget.querySelector(
                    ".preview-icon"
                  ) as HTMLElement;
                  if (icon) icon.style.opacity = "0";
                }}
              >
                <EyeOutlined
                  className="preview-icon"
                  style={{
                    fontSize: 24,
                    color: "#fff",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {idx + 1}/{images.length}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!preview}
        footer={null}
        onCancel={() => setPreview(null)}
        width="90%"
        style={{ maxWidth: 1200, top: 20 }}
        styles={{
          body: {
            padding: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          },
        }}
        title={
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            Ảnh {previewIndex + 1} / {images.length}
          </div>
        }
      >
        {preview && (
          <div style={{ width: "100%", textAlign: "center", padding: 20 }}>
            <Image
              src={preview}
              alt={`Ảnh ${previewIndex + 1}`}
              width={1000}
              height={800}
              unoptimized
              style={{
                objectFit: "contain",
                borderRadius: 8,
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default ImagePreviewGroup;
