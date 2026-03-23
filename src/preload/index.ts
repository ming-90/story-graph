import { contextBridge, ipcRenderer } from 'electron'
import type { IpcApi } from '../shared/types'

function invoke(channel: string, ...args: unknown[]): Promise<unknown> {
  return ipcRenderer.invoke(channel, ...args)
}

const api: IpcApi = {
  entities: {
    getAll: () => invoke('entities:getAll') as any,
    getById: (id) => invoke('entities:getById', id) as any,
    getByType: (type) => invoke('entities:getByType', type) as any,
    create: (input) => invoke('entities:create', input) as any,
    update: (id, input) => invoke('entities:update', id, input) as any,
    remove: (id) => invoke('entities:remove', id) as any,
    search: (query) => invoke('entities:search', query) as any
  },
  relations: {
    getAll: () => invoke('relations:getAll') as any,
    getByEntity: (entityId) => invoke('relations:getByEntity', entityId) as any,
    create: (input) => invoke('relations:create', input) as any,
    update: (id, input) => invoke('relations:update', id, input) as any,
    updateStatus: (id, status) => invoke('relations:updateStatus', id, status) as any,
    remove: (id) => invoke('relations:remove', id) as any
  },
  structuralEdges: {
    getAll: () => invoke('structuralEdges:getAll') as any,
    getByEntity: (entityId) => invoke('structuralEdges:getByEntity', entityId) as any,
    create: (input) => invoke('structuralEdges:create', input) as any,
    remove: (id) => invoke('structuralEdges:remove', id) as any
  },
  evidence: {
    getAll: () => invoke('evidence:getAll') as any,
    getById: (id) => invoke('evidence:getById', id) as any,
    getByEntityRef: (entityId) => invoke('evidence:getByEntityRef', entityId) as any,
    create: (input) => invoke('evidence:create', input) as any,
    remove: (id) => invoke('evidence:remove', id) as any
  },
  suggestions: {
    getAll: () => invoke('suggestions:getAll') as any,
    getPending: () => invoke('suggestions:getPending') as any,
    create: (input) => invoke('suggestions:create', input) as any,
    updateStatus: (id, status) => invoke('suggestions:updateStatus', id, status) as any,
    remove: (id) => invoke('suggestions:remove', id) as any
  },
  scenarios: {
    getAll: () => invoke('scenarios:getAll') as any,
    getById: (id) => invoke('scenarios:getById', id) as any,
    create: (input) => invoke('scenarios:create', input) as any,
    update: (id, input) => invoke('scenarios:update', id, input) as any,
    remove: (id) => invoke('scenarios:remove', id) as any
  },
  settings: {
    getOpenAIKey: () => invoke('settings:getOpenAIKey') as any,
    setOpenAIKey: (key) => invoke('settings:setOpenAIKey', key) as any,
    testOpenAI: () => invoke('settings:testOpenAI') as any,
    isOpenAIReady: () => invoke('settings:isOpenAIReady') as any
  }
}

contextBridge.exposeInMainWorld('api', api)

declare global {
  interface Window {
    api: IpcApi
  }
}
