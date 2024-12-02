import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import './index.d'

// Custom APIs for renderer
const api = {
  Athlete: {
    get: (id: string): Promise<Athlete> => ipcRenderer.invoke('athlete-get', id),
    loadSelf: (): Promise<Athlete> => ipcRenderer.invoke('athlete-load-self'),
    list: (): Promise<Athlete[]> => ipcRenderer.invoke('athlete-list'),
    create: (data: Athlete): Promise<Athlete> => ipcRenderer.invoke('athlete-create', data),
    update: (data: Athlete): Promise<Athlete> => ipcRenderer.invoke('athlete-update', data),
    delete: (id: string, rev: string): Promise<void> =>
      ipcRenderer.invoke('athlete-delete', id, rev)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
