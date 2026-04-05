'use client'

import { useState } from "react";
import { loadHistory, saveHistory } from "@/lib/config";

export default function HistoryTab({ onRestore }) {
  const [history, setHistory] = useState(loadHistory);

  const handleDelete = (idx) => {
    const updated = history.filter((_, i) => i !== idx);
    saveHistory(updated);
    setHistory(updated);
  };

  const handleClearAll = () => {
    saveHistory([]);
    setHistory([]);
  };

  if (!history.length) {
    return (
      <div className="history-empty">
        <p>No listings yet. Generate your first listing in the New Listing tab.</p>
      </div>
    );
  }

  return (
    <div className="history-tab">
      <div className="history-header">
        <h2 className="settings-title">Listing History</h2>
        <button className="btn-secondary btn-sm" onClick={handleClearAll}>Clear All</button>
      </div>

      <div className="history-list">
        {history.map((item, i) => (
          <div key={i} className="history-item">
            <div className="history-info">
              <div className="history-title">{item.listing?.title || "Untitled Part"}</div>
              <div className="history-meta">
                {item.itemId && <span className="history-badge">eBay #{item.itemId}</span>}
                <span className="history-date">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="history-actions">
              {item.url && (
                <a className="btn-secondary btn-sm" href={item.url} target="_blank" rel="noreferrer">
                  View
                </a>
              )}
              <button className="btn-secondary btn-sm" onClick={() => onRestore(item.listing)}>
                Restore
              </button>
              <button className="btn-danger btn-sm" onClick={() => handleDelete(i)}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
