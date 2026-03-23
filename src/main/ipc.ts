import { ipcMain } from 'electron'
import { createRepositories } from './db'
import { loadSettings, saveSettings } from './services/settings'
import { initOpenAI, testOpenAIConnection, isOpenAIReady } from './services/openaiClient'

const CHANNELS = [
  'entities:getAll', 'entities:getById', 'entities:getByType', 'entities:create',
  'entities:update', 'entities:remove', 'entities:search',
  'relations:getAll', 'relations:getByEntity', 'relations:create',
  'relations:update', 'relations:updateStatus', 'relations:remove',
  'structuralEdges:getAll', 'structuralEdges:getByEntity',
  'structuralEdges:create', 'structuralEdges:remove',
  'evidence:getAll', 'evidence:getById', 'evidence:getByEntityRef',
  'evidence:create', 'evidence:remove',
  'suggestions:getAll', 'suggestions:getPending', 'suggestions:create',
  'suggestions:updateStatus', 'suggestions:remove',
  'scenarios:getAll', 'scenarios:getById', 'scenarios:create',
  'scenarios:update', 'scenarios:remove',
  'settings:getOpenAIKey', 'settings:setOpenAIKey',
  'settings:testOpenAI', 'settings:isOpenAIReady'
]

export function registerIpcHandlers(): void {
  // HMR 재시작 시 중복 등록 방지
  CHANNELS.forEach((ch) => ipcMain.removeHandler(ch))

  const { entities, relations, structuralEdges, evidence, suggestions, scenarios } = createRepositories()

  // ─── Entities ──────────────────────────────────────────────────────────────
  ipcMain.handle('entities:getAll', () => entities.getAll())
  ipcMain.handle('entities:getById', (_e, id: string) => entities.getById(id))
  ipcMain.handle('entities:getByType', (_e, type: string) => entities.getByType(type))
  ipcMain.handle('entities:create', (_e, input) => entities.create(input))
  ipcMain.handle('entities:update', (_e, id: string, input) => entities.update(id, input))
  ipcMain.handle('entities:remove', (_e, id: string) => entities.remove(id))
  ipcMain.handle('entities:search', (_e, query: string) => entities.search(query))

  // ─── Relations ─────────────────────────────────────────────────────────────
  ipcMain.handle('relations:getAll', () => relations.getAll())
  ipcMain.handle('relations:getByEntity', (_e, entityId: string) => relations.getByEntity(entityId))
  ipcMain.handle('relations:create', (_e, input) => relations.create(input))
  ipcMain.handle('relations:update', (_e, id: string, input) => relations.update(id, input))
  ipcMain.handle('relations:updateStatus', (_e, id: string, status) => relations.updateStatus(id, status))
  ipcMain.handle('relations:remove', (_e, id: string) => relations.remove(id))

  // ─── Structural Edges ──────────────────────────────────────────────────────
  ipcMain.handle('structuralEdges:getAll', () => structuralEdges.getAll())
  ipcMain.handle('structuralEdges:getByEntity', (_e, entityId: string) => structuralEdges.getByEntity(entityId))
  ipcMain.handle('structuralEdges:create', (_e, input) => structuralEdges.create(input))
  ipcMain.handle('structuralEdges:remove', (_e, id: string) => structuralEdges.remove(id))

  // ─── Evidence ──────────────────────────────────────────────────────────────
  ipcMain.handle('evidence:getAll', () => evidence.getAll())
  ipcMain.handle('evidence:getById', (_e, id: string) => evidence.getById(id))
  ipcMain.handle('evidence:getByEntityRef', (_e, entityId: string) => evidence.getByEntityRef(entityId))
  ipcMain.handle('evidence:create', (_e, input) => evidence.create(input))
  ipcMain.handle('evidence:remove', (_e, id: string) => evidence.remove(id))

  // ─── Suggestions ───────────────────────────────────────────────────────────
  ipcMain.handle('suggestions:getAll', () => suggestions.getAll())
  ipcMain.handle('suggestions:getPending', () => suggestions.getPending())
  ipcMain.handle('suggestions:create', (_e, input) => suggestions.create(input))
  ipcMain.handle('suggestions:updateStatus', (_e, id: string, status) => suggestions.updateStatus(id, status))
  ipcMain.handle('suggestions:remove', (_e, id: string) => suggestions.remove(id))

  // ─── Scenarios ─────────────────────────────────────────────────────────────
  ipcMain.handle('scenarios:getAll', () => scenarios.getAll())
  ipcMain.handle('scenarios:getById', (_e, id: string) => scenarios.getById(id))
  ipcMain.handle('scenarios:create', (_e, input) => scenarios.create(input))
  ipcMain.handle('scenarios:update', (_e, id: string, input) => scenarios.update(id, input))
  ipcMain.handle('scenarios:remove', (_e, id: string) => scenarios.remove(id))

  // ─── Settings ──────────────────────────────────────────────────────────────
  ipcMain.handle('settings:getOpenAIKey', () => {
    return loadSettings().openaiApiKey ?? ''
  })
  ipcMain.handle('settings:setOpenAIKey', (_e, key: string) => {
    saveSettings({ openaiApiKey: key })
    if (key.trim()) initOpenAI(key.trim())
  })
  ipcMain.handle('settings:testOpenAI', () => testOpenAIConnection())
  ipcMain.handle('settings:isOpenAIReady', () => isOpenAIReady())
}
