# 桌面日历小插件

一个轻量、美观、可自定义的桌面日历应用，基于 Electron 构建。

## ✨ 功能特性

- 📅 **日历展示**: 显示当前月份的日历，支持前后翻页切换
- 📝 **事件标记**: 在日期上添加标记（如待办、节日、纪念日）
- ⏰ **提醒功能**: 支持设置事件提醒，到时弹窗提示
- 🖼️ **主题皮肤**: 提供多套主题（简约 / 卡通 / 系统跟随）
- 📌 **桌面悬浮**: 支持悬浮在桌面最前端，随时查看
- ⚙️ **设置面板**: 支持自定义字体大小、透明度、启动位置等
- 🎨 **美观界面**: 毛玻璃效果，淡蓝色悬浮主题
- 🔄 **拖拽调整**: 支持拖拽移动和调整大小

## 🛠️ 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **桌面应用**: Electron 27.x
- **构建工具**: Vite 5.x
- **数据存储**: localStorage
- **样式**: CSS Grid + Flexbox

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动开发服务器
npm run electron-dev

# 或者直接运行HTML版本
start app/renderer/index.html
```

### 构建应用

```bash
# 构建前端资源
npm run build

# 打包桌面应用
npm run dist
```

## 📁 项目结构

```
桌面日历/
├── app/                          # 应用核心代码
│   ├── main/                     # 主进程代码
│   │   └── main.js              # Electron主进程入口
│   ├── preload/                  # 预加载脚本
│   │   └── preload.js           # 预加载脚本（安全通信）
│   └── renderer/                 # 渲染进程代码
│       ├── index.html           # 主界面HTML
│       └── app.js               # 前端应用逻辑
├── src/                          # 源代码模块
│   └── utils/                    # 工具类
│       ├── dateUtils.js         # 日期处理工具
│       ├── eventManager.js      # 事件管理工具
│       └── storage.js           # 数据存储工具
├── assets/                       # 静态资源
│   ├── icon.png                 # 应用图标
│   ├── icon.ico                 # Windows图标
│   └── tray-icon.png            # 系统托盘图标
├── config/                       # 配置文件
│   ├── app.config.js            # 应用配置
│   └── project.config.json      # 项目配置
├── scripts/                      # 构建脚本
│   ├── build.js                 # 构建脚本
│   ├── deploy.js                # 部署脚本
│   └── generate-icons.js        # 图标生成脚本
├── docs/                         # 项目文档
│   ├── PROJECT_STRUCTURE.md     # 项目结构说明
│   ├── DEVELOPMENT_GUIDE.md     # 开发指南
│   └── 开发文档.md              # 开发文档
├── build/                        # 构建输出目录
├── dist/                         # 分发目录
├── package.json                  # 项目配置
├── vite.config.js               # Vite构建配置
├── .gitignore                   # Git忽略文件
├── LICENSE                      # 许可证
└── README.md                    # 项目说明
```

## 📖 文档

- [项目结构说明](docs/PROJECT_STRUCTURE.md)
- [开发指南](docs/DEVELOPMENT_GUIDE.md)
- [开发文档](docs/开发文档.md)

## 🎯 使用说明

### 基本操作
1. **查看日历**: 默认显示当前月份
2. **切换月份**: 点击左右箭头按钮
3. **添加日程**: 点击"+"按钮添加日程
4. **拖拽移动**: 拖拽标题栏移动窗口
5. **调整大小**: 拖拽窗口边缘调整大小

### 快捷键
- `Ctrl+Shift+C`: 显示/隐藏窗口
- `Ctrl+Q`: 退出应用

## 🔧 配置选项

### 主题设置
- 简约主题
- 深色主题  
- 卡通主题

### 显示选项
- 显示周末
- 高亮今日
- 透明度调节
- 字体大小

## 🐛 故障排除

### 常见问题

1. **依赖安装失败**
   ```bash
   # 使用国内镜像源
   npm config set registry https://registry.npmmirror.com
   npm install
   ```

2. **Electron启动失败**
   ```bash
   # 直接运行HTML版本
   start app/renderer/index.html
   ```

3. **构建失败**
   ```bash
   # 清理缓存重新构建
   npm run clean
   npm run build
   ```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📝 更新日志

### v1.2.0 (当前版本)
- ✨ 优化项目结构
- 🎨 更新悬浮颜色为淡蓝色
- 📁 重新组织目录结构
- 📚 完善项目文档
- 🔧 优化构建配置

### v1.1.0
- ✨ 添加日程管理功能
- 🎨 优化界面设计
- 🔧 改进用户体验

### v1.0.0
- 🎉 初始版本发布
- 📅 基础日历功能
- 🖼️ 主题系统
- 📌 桌面悬浮功能