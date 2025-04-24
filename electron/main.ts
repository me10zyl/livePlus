import { app, BrowserWindow,ipcMain } from 'electron'
//import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Store from 'electron-store';
import {getDouyuFollowList} from "./platforms/douyu";
import {getBilibiliFollowList} from "./platforms/bilibili";
import {getHuyaFollowList} from "./platforms/huya";
import {getDouyinFollowList} from './platforms/douyin'
// 初始化存储
const store = new Store();
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
    win.webContents.openDevTools()
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

ipcMain.handle('get-following-list', async (event, platform, forceRefresh = false) => {
  // 如果不强制刷新，先尝试从缓存获取
  if (!forceRefresh) {
    const cachedList = store.get(`followingList.${platform}`, null);
    if (cachedList) {
      console.log(`使用${platform}缓存数据`);
      return cachedList;
    }
  }
  
  const cookies = store.get(`cookies.${platform}`, '') as string
  if(!cookies){
    return {error: '未设置Cookie'}
  }
  console.log('获取关注列表,', platform, forceRefresh ? '(强制刷新)' : '')
  try {
    let result;
    switch (platform) {
      case 'douyin':
        result = await getDouyinFollowList(cookies);
        break;
      case 'douyu':
        result = await getDouyuFollowList(cookies);
        break;
      case 'bilibili':
        result = await getBilibiliFollowList(cookies);
        break;
      case 'huya':
        result = await getHuyaFollowList(cookies);
        break;
      default:
        throw new Error('不支持的平台');
    }
    
    // 将结果保存到缓存
    if (!result.error && result.length > 0) {
      store.set(`followingList.${platform}`, result);
    }
    
    return result;
  } catch (error) {
    console.error(`获取${platform}关注列表失败:`, error);
    return { error: '获取关注列表失败' };
  }
});

ipcMain.handle('set-following-list', async (event, platform, list) => {
  store.set(`followingList.${platform}`, list);
  return true;
});