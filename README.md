# Voyager - 全球足迹点亮工具 (Travel Footprint Tracker)

Voyager 是一个先进的旅行足迹记录与数据可视化工具。无论您是在中国还是在全球旅行，都可以用它精确到“市级/县级”地记录您的旅行回忆、想去的地方和游玩感受。

## 🌟 核心功能 (Features)

1. **多层级地理可视化与地图下钻**
   - **全球视角**: 浏览您去过的国家和地区。
   - **中国省市县三级联动**: 点击省份下钻到地级市，再下钻到区县，实现精细化足迹标记。
   - **3D 丝滑过渡**: 使用 MapLibre 实现顺畅的视角变化和 FlyTo 动画。

2. **精细化的足迹管理**
   - 记录“已去过 (Visited)”和“想去 (Wishlist)”的地点。
   - 为每个地点添加游玩日期和个人旅行笔记。
   - 自动生成足迹统计面板（国家数、省份数、城市数等），实时更新您的旅行成就。

3. **内置海量旅游名胜与文化数据库 (内置智能 AI 数据)**
   - **UNESCO 世界遗产**: 点击对应的城市，即可查看当地拥有的“世界文化遗产”、“自然遗产”和“双重遗产”，带有专属精美徽章。
   - **国家 5A 级景区**: 覆盖全国 300+ 个 5A 级景区，精准匹配到地级市，显示专属的 🏅“AAAAA景区”金牌标签。
   - **百科级摘要**: 为主要旅游城市提供风土人情摘要和知名地标景点一览。
   - **罕见自然景观**: 特别标注了一些独特的人文与自然体验。

4. **离线与 PWA 支持**
   - 基于 Vue 3 + Vite 构建，支持 PWA（渐进式 Web 应用），可安装至桌面或手机主屏幕，离线随时随地查看您的足迹。

5. **本地存储**
   - 您的旅行数据安全地存储在浏览器的 IndexedDB 中。

## 🚀 技术栈 (Tech Stack)

- **前端框架**: Vue 3 (Composition API, `<script setup>`)
- **构建工具**: Vite
- **地图引擎**: MapLibre GL JS
- **状态管理**: Pinia
- **UI 样式**: TailwindCSS
- **图标**: Lucide Vue Next
- **存储方案**: LocalForage (IndexedDB)
- **部署**: Netlify (CI/CD 自动化构建)

## 📦 本地开发 (Local Development)

```bash
# 安装依赖
npm install

# 启动开发服务器
cd packages/web-app
npm run dev

# 构建生产版本
npm run build
```

## 🌐 部署 (Deployment)

项目配置了自动化的 CI/CD 流程。每次推送代码到 `main` 分支时，Netlify 会自动拉取最新代码并进行全站编译部署。

1. 提交代码: `git add . && git commit -m "Update feature"`
2. 推送到云端: `git push origin main`
3. Netlify 云端将在几分钟内完成构建并上线新版本。

---
*Built with ❤️ by Your AI Assistant*
