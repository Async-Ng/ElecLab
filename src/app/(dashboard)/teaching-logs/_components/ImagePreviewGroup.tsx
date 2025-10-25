import React, { useState } from "react";
import { Modal } from "antd";
import Image from "next/image";

const ImagePreviewGroup: React.FC<{ images: string[] }> = ({ images }) => {
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <>
      <span>
        {images.map((img, idx) => (
          <Image
            key={idx}
            src={`data:image/jpeg;base64,${img}`}
            alt={`log-img-${idx}`}
            width={60}
            height={60}
            style={{
              marginRight: 8,
              borderRadius: 4,
              cursor: "pointer",
              objectFit: "cover",
            }}
            onClick={() => setPreview(`data:image/jpeg;base64,${img}`)}
          />
        ))}
      </span>
      <Modal
        open={!!preview}
        footer={null}
        onCancel={() => setPreview(null)}
        width={900}
        bodyStyle={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {preview && (
          <div style={{ width: "100%", maxWidth: 900, textAlign: "center" }}>
            <Image
              src={preview}
              alt="preview"
              width={800}
              height={600}
              style={{ objectFit: "contain", borderRadius: 8 }}
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default ImagePreviewGroup;
