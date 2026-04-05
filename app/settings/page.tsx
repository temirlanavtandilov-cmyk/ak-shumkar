'use client'

import { useState, useEffect } from "react";
import SettingsTab from "@/components/SettingsTab";
import { loadConfig } from "@/lib/config";

export default function SettingsPage() {
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  return (
    <main className="app-main">
      <SettingsTab config={config} onSave={setConfig} />
    </main>
  );
}
