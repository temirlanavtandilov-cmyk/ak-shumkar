'use client'

function SkeletonBar({ width = "100%", height = 14, style = {} }) {
  return <div className="skel-bar" style={{ width, height, ...style }} />;
}

function SkeletonCard({ rows = 3 }) {
  return (
    <div className="result-card skel-card">
      <div className="result-card-header">
        <SkeletonBar width={80} height={11} />
      </div>
      <div className="result-card-body">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="editable-field">
            <SkeletonBar width={60} height={10} />
            <SkeletonBar width={i % 2 === 0 ? "100%" : "75%"} height={34} style={{ borderRadius: 5 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkeletonLoader() {
  return (
    <div className="skeleton-wrap">
      <SkeletonCard rows={1} />
      <SkeletonCard rows={4} />
      <SkeletonCard rows={2} />
      <SkeletonCard rows={1} />
    </div>
  );
}
