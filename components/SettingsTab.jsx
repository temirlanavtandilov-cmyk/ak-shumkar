'use client'

import { useState, useEffect } from "react";

const FIELDS = [
  { key: "proxyUrl",     label: "Cloudflare Worker URL",                       type: "text",     placeholder: "https://your-worker.workers.dev" },
  { key: "geminiKey",    label: "Gemini API Key",                               type: "password", placeholder: "AIza..." },
  { key: "imgbbKey",     label: "imgbb API Key",                                type: "password", placeholder: "For photo hosting" },
  { key: "appId",        label: "eBay App ID",                                  type: "text",     placeholder: "YourApp-123..." },
  { key: "devId",        label: "eBay Dev ID",                                  type: "text",     placeholder: "xxxxxxxx-xxxx-..." },
  { key: "certId",       label: "eBay Cert ID",                                 type: "password", placeholder: "xxxxxxxx-xxxx-..." },
  { key: "token",        label: "eBay Auth Token",                              type: "password", placeholder: "v^1.1..." },
  { key: "location",     label: "Location",                                     type: "text",     placeholder: "Chicago, IL" },
  { key: "shippingCost", label: "Default Shipping Cost ($)",                    type: "text",     placeholder: "19.99" },
  { key: "campaignId",   label: "eBay Campaign ID (for Promoted Listings)",     type: "text",     placeholder: "123456789 — from Seller Hub → Marketing" },
];

export default function SettingsTab({ config, onSave }) {
  const [form, setForm] = useState({ ...config });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync form when config loads from Clerk (arrives after initial render)
  useEffect(() => {
    if (Object.keys(config).length > 0) {
      setForm({ ...config });
    }
  }, [JSON.stringify(config)]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-tab">
      <h2 className="settings-title">API Settings</h2>
      <p className="settings-hint">Settings are saved to your account — available on any device when you sign in.</p>

      <div className="settings-grid">
        {FIELDS.map(({ key, label, type, placeholder }) => (
          <div key={key} className="settings-field">
            <label className="field-label">{label}</label>
            <input
              className="field-input"
              type={type}
              value={form[key] || ""}
              onChange={set(key)}
              placeholder={placeholder}
              autoComplete="off"
            />
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
