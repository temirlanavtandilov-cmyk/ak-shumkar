'use client'

import { useState } from "react";
import { saveConfig } from "@/lib/config";

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

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    saveConfig(form);
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-tab">
      <h2 className="settings-title">API Settings</h2>
      <p className="settings-hint">All keys are stored in your browser's localStorage — never sent anywhere except through your own Worker.</p>

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

      <button className="btn-primary" onClick={handleSave}>
        {saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
