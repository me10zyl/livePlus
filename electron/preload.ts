import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electron', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  // Cookie 相关操作
  getCookie: (platform: string) => ipcRenderer.invoke('get-cookie', platform),
  setCookie: (platform: string, cookie: string) => ipcRenderer.invoke('set-cookie', platform, cookie),

  // 关注列表相关操作
  getFollowingList: (platform: string, forceRefresh: boolean) => ipcRenderer.invoke('get-following-list', platform, forceRefresh),
  setFollowingList: (platform: string, list: any[]) => ipcRenderer.invoke('set-following-list', platform, list),
})
