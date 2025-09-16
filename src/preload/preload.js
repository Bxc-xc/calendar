const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 通知功能
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 窗口控制
  minimize: () => ipcRenderer.send('minimize-window'),
  close: () => ipcRenderer.send('close-window'),
  
  // 数据存储
  saveData: (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  
  loadData: (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
});