# 开发指南

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
npm run electron-dev
```

### 构建应用
```bash
npm run build
npm run dist
```

## 📁 代码结构

### 主进程 (app/main/)
负责应用的生命周期管理和系统级操作。

**主要文件**:
- `main.js`: 主进程入口，创建窗口和管理应用

**关键功能**:
- 窗口创建和管理
- 系统托盘
- 快捷键注册
- 应用生命周期

### 渲染进程 (app/renderer/)
负责用户界面和交互逻辑。

**主要文件**:
- `index.html`: 主界面HTML
- `app.js`: 前端应用逻辑

**关键功能**:
- 日历显示
- 日程管理
- 用户交互
- 数据展示

### 工具模块 (src/utils/)
提供可复用的工具函数。

**主要文件**:
- `dateUtils.js`: 日期处理工具
- `eventManager.js`: 事件管理工具
- `storage.js`: 数据存储工具

## 🎨 界面开发

### CSS样式
- 使用CSS3特性
- 支持响应式设计
- 使用CSS变量管理主题

### 交互效果
- 悬浮效果: 淡蓝色主题
- 动画效果: 平滑过渡
- 拖拽功能: 支持窗口拖拽

### 主题系统
- 支持多种主题
- 可自定义颜色
- 响应式布局

## 📊 数据管理

### 本地存储
使用localStorage存储用户数据：
- 日程安排
- 用户设置
- 主题偏好

### 数据结构
```javascript
// 日程数据结构
{
  id: string,           // 唯一标识
  title: string,        // 标题
  date: string,         // 日期 (YYYY-MM-DD)
  time: string,         // 时间 (HH:mm)
  description: string,  // 描述
  completed: boolean,   // 是否完成
  createdAt: string,    // 创建时间
  updatedAt: string     // 更新时间
}
```

## 🔧 配置管理

### 应用配置
在`config/app.config.js`中配置：
- 主题设置
- 默认选项
- 事件类型

### 构建配置
在`vite.config.js`中配置：
- 开发服务器
- 构建选项
- 路径映射

## 🐛 调试技巧

### 开发工具
- 使用Chrome DevTools
- 启用Electron DevTools
- 查看控制台日志

### 常见问题
1. **依赖安装失败**: 使用国内镜像源
2. **构建失败**: 检查路径配置
3. **功能异常**: 查看控制台错误

## 📦 打包部署

### 构建流程
1. 编译前端资源
2. 复制必要文件
3. 使用electron-builder打包

### 平台支持
- Windows: NSIS安装包
- macOS: DMG镜像
- Linux: AppImage

## 🔄 版本管理

### 版本号规则
使用语义化版本号：`主版本.次版本.修订版本`

### 更新日志
在`docs/`目录下维护更新日志。

## 📝 代码规范

### 命名规范
- 文件名: 使用小写字母和连字符
- 变量名: 使用驼峰命名法
- 常量名: 使用大写字母和下划线

### 注释规范
- 重要功能添加注释
- 使用JSDoc格式
- 保持注释与代码同步

### 代码组织
- 按功能模块分离
- 保持文件大小合理
- 使用ES6+语法

## 🧪 测试

### 功能测试
- 手动测试主要功能
- 检查不同屏幕尺寸
- 验证数据持久化

### 性能测试
- 监控内存使用
- 检查响应时间
- 优化渲染性能

## 📚 参考资料

- [Electron官方文档](https://www.electronjs.org/docs)
- [Vite官方文档](https://vitejs.dev/guide/)
- [CSS Grid布局](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)