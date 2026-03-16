import type { IpcApi } from '../../../shared/types'

function getApi(): IpcApi {
  if (typeof window === 'undefined' || !window.api) {
    throw new Error(
      '[StoryGraph] window.api is not available. ' +
        'Make sure the app is running inside Electron and the preload script is loaded correctly.'
    )
  }
  return window.api
}

export const api: IpcApi = new Proxy({} as IpcApi, {
  get(_target, namespace: string) {
    return new Proxy(
      {},
      {
        get(_t, method: string) {
          return (...args: unknown[]) => {
            return (getApi() as any)[namespace][method](...args)
          }
        }
      }
    )
  }
})
