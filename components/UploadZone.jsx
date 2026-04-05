'use client'

import { useRef, useState } from "react";

export default function UploadZone({ onImages }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const processFiles = async (files) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 10);
    const results = await Promise.all(
      imageFiles.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                data: e.target.result.split(",")[1],
                mime: file.type,
                preview: URL.createObjectURL(file),
                name: file.name,
              });
            };
            reader.readAsDataURL(file);
          })
      )
    );
    onImages(results);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={`upload-zone ${dragging ? "dragging" : ""}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => processFiles(e.target.files)}
      />
      <div className="upload-icon">📷</div>
      <p className="upload-label">Drop part photos here or click to upload</p>
      <p className="upload-hint">JPG, PNG, HEIC — up to 10 photos</p>
    </div>
  );
}
