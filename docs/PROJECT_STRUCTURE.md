# 项目目录结构

## 目录说明

```
日历2/
├── src/                          # 源代码目录
│   ├── main/                     # Electron 主进程
│   │   └── main.js              # 主进程入口文件
│   ├── preload/                  # 预加载脚本
│   │   └── preload.js           # 预加载脚本
│   ├── renderer/                 # 渲染进程（前端）
│   │   ├── index.html           # 主页面
│   │   ├── app.js               # 前端应用逻辑
│   │   └── styles.css           # 样式文件
│   └── utils/                    # 工具类
│       ├── dateUtils.js         # 日期工具
│       ├── eventManager.js      # 事件管理
│       └── storage.js           # 存储管理
├── assets/                       # 静态资源
│   ├── icons/                   # 图标文件
│   │   ├── icon.png
│   │   ├── icon.ico
│   │   ├── icon.icns
│   │   └── tray-icon.png
│   └── images/                  # 其他图片资源
├── config/                       # 配置文件
│   ├── app.config.js            # 应用配置
│   └── project.config.json      # 项目配置
├── scripts/                      # 构建脚本
│   ├── build.js
│   ├── dev.js
│   ├── deploy.js
│   ├── start.js
│   └── generate-icons.js
├── dist/                         # 构建输出目录
├── docs/                         # 文档
│   ├── DEVELOPMENT_GUIDE.md
│   ├── PROJECT_STRUCTURE.md
│   └── 开发文档.md
├── package.json                  # 项目配置
├── vite.config.js               # Vite 配置
├── README.md                     # 项目说明
└── LICENSE                       # 许可证
```

## 目录职责

### src/ 目录
- **main/**: Electron 主进程代码，负责窗口管理、系统托盘、IPC 通信等
- **preload/**: 预加载脚本，在渲染进程中安全地暴露 Node.js API
- **renderer/**: 前端代码，包括 HTML、CSS、JavaScript
- **utils/**: 通用工具类，如日期处理、事件管理、数据存储等

### assets/ 目录
- **icons/**: 应用图标文件，包括不同格式和尺寸
- **images/**: 其他图片资源

### config/ 目录
- 应用配置文件，包括应用设置和项目配置

### scripts/ 目录
- 构建和部署脚本

### docs/ 目录
- 项目文档

## 文件说明

### 核心文件
- `src/main/main.js`: Electron 主进程入口文件
- `src/preload/preload.js`: 预加载脚本
- `src/renderer/index.html`: 应用主页面
- `src/renderer/app.js`: 前端应用逻辑
- `src/renderer/styles.css`: 应用样式

### 配置文件
- `package.json`: 项目依赖和脚本配置
- `vite.config.js`: Vite 构建工具配置
- `config/app.config.js`: 应用配置
- `config/project.config.json`: 项目配置

### 工具类
- `src/utils/dateUtils.js`: 日期处理工具
- `src/utils/eventManager.js`: 事件管理工具
- `src/utils/storage.js`: 数据存储工具

## 开发指南

### 添加新功能
1. 前端功能：在 `src/renderer/` 目录下添加或修改文件
2. 主进程功能：在 `src/main/main.js` 中添加
3. 工具类：在 `src/utils/` 目录下添加
4. 静态资源：放在 `assets/` 对应子目录下

### 构建和运行
```bash
# 开发模式
npm run dev

# 构建
npm run build

# 运行 Electron 应用
npm run electron

# 开发模式（同时运行 Vite 和 Electron）
npm run electron-dev
```

## 注意事项

1. 所有路径引用已更新为新的目录结构
2. 图标文件统一放在 `assets/icons/` 目录下
3. 工具类统一放在 `src/utils/` 目录下
4. 配置文件统一放在 `config/` 目录下