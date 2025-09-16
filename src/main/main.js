const { app, BrowserWindow, ipcMain, Notification, Menu, Tray, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let isQuitting = false;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 350,
    height: 600,
    minWidth: 280,
    minHeight: 450,
    maxWidth: 1920,
    maxHeight: 1080,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    },
    frame: false, // 无边框窗口
    transparent: true, // 透明背景
    alwaysOnTop: true, // 始终置顶
    resizable: true,
    skipTaskbar: true, // 不在任务栏显示
    icon: path.join(__dirname, '../../assets/icons/icon.png')
  });

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 创建系统托盘
  createTray();

  // 窗口事件处理
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  // 设置菜单
  const template = [
    {
      label: '日历',
      submenu: [
        {
          label: '显示/隐藏',
          accelerator: 'CmdOrCtrl+Shift+C',
          click: () => {
            if (mainWindow.isVisible()) {
              mainWindow.hide();
            } else {
              mainWindow.show();
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(icon);
  tray.setToolTip('桌面日历');
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示日历',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

// 应用准备就绪
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 通信处理
ipcMain.handle('show-notification', (event, title, body) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: body,
      icon: path.join(__dirname, '../../assets/icons/icon.png')
    });
    notification.show();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// 处理窗口大小调整请求
ipcMain.handle('resize-window', (event, width, height) => {
  if (mainWindow) {
    mainWindow.setSize(width, height);
    
    // 总是居中窗口
    mainWindow.center();
    
    return { success: true };
  }
  return { success: false };
});

// 处理窗口关闭请求
ipcMain.on('close-window', () => {
  if (mainWindow) {
    isQuitting = true;
    mainWindow.close();
  }
});


// 快捷键注册
app.on('ready', () => {
  const { globalShortcut } = require('electron');
  
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
});

app.on('will-quit', () => {
  const { globalShortcut } = require('electron');
  globalShortcut.unregisterAll();
});