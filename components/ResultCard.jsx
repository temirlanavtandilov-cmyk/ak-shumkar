'use client'

import { useState } from "react";

/**
 * @param {{ title: string, children: any, copyValue?: any }} props
 */
export default function ResultCard({ title, children, copyValue }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text =
      typeof copyValue === "string"
        ? copyValue
        : JSON.stringify(copyValue, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="result-card">
      <div className="result-card-header">
        <h3 className="result-card-title">{title}</h3>
        {copyValue !== undefined && copyValue !== null && (
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
      <div className="result-card-body">{children}</div>
    </div>
  );
}
