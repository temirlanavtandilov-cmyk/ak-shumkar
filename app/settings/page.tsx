'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from "react"
import SettingsTab from "@/components/SettingsTab"
import { saveConfig } from "@/lib/config"

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [config, setConfig] = useState<any>({})

  useEffect(() => {
    if (!isLoaded || !user) return
    const saved = (user.unsafeMetadata as any)?.config || {}
    setConfig(saved)
  }, [isLoaded, user])

  const handleSave = async (form: any) => {
    await user?.update({ unsafeMetadata: { config: form } })
    saveConfig(form) // keep localStorage in sync as local cache
    setConfig(form)
  }

  return (
    <main className="app-main">
      <SettingsTab config={config} onSave={handleSave} />
    </main>
  )
}
