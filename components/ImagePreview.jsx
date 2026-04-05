'use client'

export default function ImagePreview({ images, onRemove }) {
  if (!images.length) return null;

  return (
    <div className="image-preview-grid">
      {images.map((img, i) => (
        <div key={i} className="image-thumb">
          <img src={img.preview} alt={`Part ${i + 1}`} />
          <button
            className="remove-btn"
            onClick={(e) => { e.stopPropagation(); onRemove(i); }}
            title="Remove photo"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
