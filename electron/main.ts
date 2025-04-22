import { app, BrowserWindow } from 'electron'
//import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

//const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)


// IPC事件处理
ipcMain.handle('get-cookie', async (event, platform) => {
  return store.get(`cookies.${platform}`, '');
});

ipcMain.handle('set-cookie', async (event, platform, cookie) => {
  store.set(`cookies.${platform}`, cookie);
  return true;
});

ipcMain.handle('get-following-list', async (event, platform) => {
  //return store.get(`followingList.${platform}`, []);
  const cookies  = store.get(`cookies.${platform}`, '') as string
  if(!cookies){
    return {error: '未设置Cookie'}
  }
  try {
    switch (platform) {
      case 'douyin':
        return await getDouyinFollowList(cookies);
      case 'douyu':
        return await getDouyuFollowList(cookies);
      case 'bilibili':
        return await getBilibiliFollowList(cookies);
      case 'huya':
        return await getHuyaFollowList(cookies);
      default:
        throw new Error('不支持的平台');
    }
  } catch (error) {
    console.error(`获取${platform}关注列表失败:`, error);
    return { error: '获取关注列表失败' };
  }
});

ipcMain.handle('set-following-list', async (event, platform, list) => {
  store.set(`followingList.${platform}`, list);
  return true;
});