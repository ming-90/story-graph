import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

export interface AppSettings {
  openaiApiKey?: string
  openaiModel?: string
}

function getSettingsPath(): string {
  const dir = app.getPath('userData')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'settings.json')
}

export function loadSettings(): AppSettings {
  const path = getSettingsPath()
  if (!existsSync(path)) return {}
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return {}
  }
}

export function saveSettings(settings: AppSettings): void {
  const path = getSettingsPath()
  const current = loadSettings()
  writeFileSync(path, JSON.stringify({ ...current, ...settings }, null, 2), 'utf-8')
}
