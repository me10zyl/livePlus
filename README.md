# 直播平台关注监控工具

这是一个基于 Electron 和 React 开发的桌面应用，用于监控多个直播平台（斗鱼、B站、虎牙、抖音）的关注主播直播状态，并且可以观看直播。

注意：目前该项目还在开发中，功能还不完善，可能存在一些问题，请谨慎使用。

## 功能特点

- 多平台支持：同时监控斗鱼、B站、虎牙、抖音四大直播平台
- 实时状态：查看关注主播的在线状态、观看人数等信息
- 缓存机制：使用本地缓存减少网络请求，提高应用响应速度
- 统一界面：在一个应用中管理所有平台的关注列表
- 平台统计：直观展示各平台关注数量和在线主播数量

## 安装与运行

### 环境要求

- Node.js 16+
- npm 或 yarn

### 开发环境搭建

1. 克隆仓库
```bash
git clone https://github.com/me10zyl/livePlus.git
```
2. 安装依赖
```bash
npm install
```
3. 启动应用
```bash
npm run dev
```
4. 打包应用
```bash
npm run build
```
构建完成后，可在 `dist` 目录找到打包好的应用程序。

## 使用说明
1. 首次使用时，需要在各平台设置页面配置 Cookie 信息
2. 配置完成后，应用会自动获取您在各平台的关注列表
3. 在主面板可以查看所有平台正在直播的主播
4. 点击各平台标签可以查看特定平台的关注列表
5. 使用"刷新所有平台"按钮可以强制刷新缓存，获取最新数据

## 技术栈
Electron: 跨平台桌面应用框架
React: 用户界面库
TypeScript: 类型安全的 JavaScript 超集
Electron Store: 本地数据持久化
Vite: 现代前端构建工具

## 项目结构
```
livePlus/
├── electron/             # Electron 主进程代码
│   ├── main.ts           # 主进程入口
│   ├── preload.mjs       # 预加载脚本
│   └── platforms/        # 各平台 API 实现
├── src/                  # 渲染进程代码 (React)
│   ├── components/       # 可复用组件
│   ├── pages/            # 页面组件
│   └── App.tsx           # 应用入口
├── common/               # 共享类型和工具
└── dist/                 # 构建输出目录
```
## 许可证

MIT

## 贡献

欢迎提出问题、建议或贡献代码。请在 GitHub 上创建 Issue 或 Pull Request。