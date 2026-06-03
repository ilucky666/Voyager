# Voyager 🌍

[![Vue](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MapLibre](https://img.shields.io/badge/MapLibre-GL--JS-0081F1?logo=maplibre&logoColor=white)](https://maplibre.org/)
[![PWA](https://img.shields.io/badge/PWA-Supported-5A0FC8?logo=pwa&logoColor=white)](#)

[English](#english) | [中文](#chinese)

---

<a name="chinese"></a>
## 介绍 (中文)

Voyager 是一款**本地优先 (Local-first)** 的旅行足迹管理与 WebGIS 可视化应用。它无需后端服务器，采用极致的 iOS 风格毛玻璃 (Glassmorphism) UI 设计，并支持作为 PWA 独立安装到手机桌面，为您提供沉浸式的足迹打卡体验。

### ✨ 核心特性

- 🗺️ **精准的行政区划管理**：支持省、市、县（区）三级联动，并在 3D WebGIS 地图上直观展示你的旅行足迹（想去 / 去过）。
- 📝 **旅行手记与时间轴**：不仅是打卡点，你还可以为每一个足迹添加详细的“游玩日期”和“旅行日记”。
- 📱 **原生级 PWA 体验**：支持保存到 iOS/Android 桌面，脱离浏览器边框，提供丝滑的物理弹性动画和全屏体验。
- ☁️ **WebDAV 永久云同步**：内置 WebDAV 客户端。你可以绑定坚果云、Nextcloud 等第三方网盘，随时将本地足迹安全地永久备份到你自己的云端，拒绝数据被大厂绑架。
- ⚡ **跨端二维码秒传**：PC 与手机数据不互通？只需在 PC 上生成高度压缩的同步二维码，手机相机一扫即可瞬间完成数据迁移。

### 🚀 如何运行

本项目使用 Vite 和 Vue 3 构建。

```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发服务器
npm run dev

# 3. 打包构建
npm run build
```

### 💡 同步与部署注意事项

由于本应用采用纯前端架构：
1. **跨域问题**：生产环境下的免费静态托管（如 Netlify）通常会拦截 WebDAV 底层的 `PROPFIND` 协议请求。推荐使用**本地 Vite 代理** (`npm run dev`) 进行 WebDAV 的上传/下载。
2. **移动端最佳实践**：推荐通过手机连接电脑生成的局域网 IP (如 `http://192.168.x.x:5173`) 添加到手机桌面，以实现真正的离线记录与回站局域网同步。

---

<a name="english"></a>
## Introduction (English)

Voyager is a **Local-first** travel footprint management and WebGIS visualization application. Built entirely on the frontend with a stunning iOS-style Glassmorphism UI, it can be installed as a PWA on your mobile devices for an immersive, native-like experience.

### ✨ Key Features

- 🗺️ **Administrative Division Tracking**: Mark places you've visited or wish to visit at the provincial, municipal, and county levels across China, displayed beautifully on a 3D WebGIS map.
- 📝 **Travel Journals & Timeline**: Log specific visit dates and write travel notes for every footprint you leave behind.
- 📱 **Native-like PWA**: Installable on iOS/Android home screens. Enjoy physics-based micro-animations and a full-screen, borderless interface.
- ☁️ **WebDAV Cloud Sync**: Features a built-in WebDAV client. Bring Your Own Cloud (BYOC) by connecting services like Nextcloud or Jianguoyun to securely backup your data permanently. Keep your data in your own hands.
- ⚡ **QR Code Quick Transfer**: Seamlessly transfer footprint data between your PC and phone by scanning a highly compressed QR code.

### 🚀 Getting Started

This project is built with Vite and Vue 3.

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev

# 3. Build for production
npm run build
```

### 💡 Notes on Syncing and Deployment

Because this is a pure frontend (backend-less) application:
1. **CORS & WebDAV**: Free static hosting platforms (e.g., Netlify) often block underlying WebDAV requests (like `PROPFIND`). It is highly recommended to use the built-in **Vite Dev Server Proxy** (`npm run dev`) to upload/download WebDAV data.
2. **Mobile Best Practice**: For the best offline experience and syncing capabilities, access the app via your PC's local LAN IP (e.g., `http://192.168.x.x:5173`), add the PWA to your iOS home screen, and sync whenever you return to the same network.

---

### 📄 License

MIT License. Feel free to explore, learn, and travel!
