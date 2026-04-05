'use client'

export default function StatusBar({ status }) {
  if (!status || status.type === "idle") return null;

  return (
    <div className={`status-bar status-${status.type}`}>
      {status.type === "loading" && <span className="spinner" />}
      {status.type === "success" && <span className="status-icon">✓</span>}
      {status.type === "error" && <span className="status-icon">✕</span>}
      <span>{status.message}</span>
    </div>
  );
}
