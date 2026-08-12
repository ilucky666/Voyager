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

- 🗺️ **全球 4D 旅游知识图谱**：内置全球多达 4006 个省份/地区的结构化文案，覆盖东南亚、欧美、非洲等全球各大洲，全部由真实 AI 提取和总结了当地的核心游玩体验与著名地标。
- 🏛️ **精准的联合国世界遗产映射**：收录并自动匹配了高达 1647 处国内外 UNESCO 世界自然与文化遗产。原生支持中英双语，为您揭示每个偏远省份隐藏的史诗级风景。
- 📍 **精细化行政区划管理**：不仅支持全球省州级记录，更针对国内地图支持省、市、县（区）三级下钻联动，在 3D WebGIS 引擎的加持下呈现您的“去过”与“想去”足迹。
- 📝 **旅行手记与时间轴**：不再只是冷冰冰的打卡点。您可以为每一次踏足添加详尽的“游玩日期”和“旅行日记”，构建您的私人旅行回忆录。
- 📱 **原生级 PWA 沉浸体验**：完全支持 PWA (Progressive Web App)，可直接安装到 iOS/Android 手机桌面。脱离浏览器边框，拥有丝滑的物理弹性动画和磨砂玻璃 (Glassmorphism) UI 设计。
- ☁️ **WebDAV 永久云同步 (BYOC)**：自带 WebDAV 客户端，不依赖特定服务商。您可以绑定坚果云、Nextcloud 或群晖 NAS 等私人网盘，将本地足迹安全、永久地备份到您自己的云端。
- ⚡ **跨端二维码秒传**：电脑和手机数据不互通？只需在 PC 上生成经过极度压缩加密的二维码，手机端扫码即可瞬间完成庞大足迹数据的秒级同步。

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

- 🗺️ **Global 4D Travel Knowledge Graph**: Built-in structured data for up to 4,006 provinces and regions worldwide. Every obscure province across Southeast Asia, Europe, Africa, and the Americas has been processed by genuine AI to summarize core travel experiences and landmarks.
- 🏛️ **Precise UNESCO World Heritage Mapping**: Contains meticulously matched data for over 1,647 UNESCO Natural and Cultural Heritage sites. Native bilingual (English & Chinese) support uncovers hidden epic landscapes in every corner of the globe.
- 📍 **Administrative Division Tracking**: Offers tracking at the provincial/state level globally, and drills down to municipal and county levels for specific countries (e.g., China). Displayed beautifully on a high-performance 3D WebGIS engine.
- 📝 **Travel Journals & Timeline**: More than just check-ins. Log specific visit dates and craft detailed travel notes for every footprint to build your private travel memoir.
- 📱 **Native-like PWA Immersion**: Fully installable as a Progressive Web App on iOS/Android home screens. Enjoy physics-based micro-animations and a stunning, borderless Glassmorphism UI design.
- ☁️ **WebDAV Cloud Sync (BYOC)**: Features a built-in WebDAV client. Bring Your Own Cloud by connecting services like Nextcloud, Synology NAS, or Jianguoyun to securely and permanently back up your data. Keep your footprints strictly in your own hands.
- ⚡ **QR Code Quick Transfer**: Seamlessly transfer massive footprint data between your PC and phone by scanning a highly compressed, secure QR code. No backend servers required.

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
