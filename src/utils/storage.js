// 数据存储工具类
class StorageManager {
  constructor() {
    this.prefix = 'desktop-calendar-';
  }

  // 生成带前缀的键名
  getKey(key) {
    return `${this.prefix}${key}`;
  }

  // 保存数据
  save(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(this.getKey(key), serializedData);
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  }

  // 加载数据
  load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(this.getKey(key));
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('加载数据失败:', error);
      return defaultValue;
    }
  }

  // 删除数据
  remove(key) {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error('删除数据失败:', error);
      return false;
    }
  }

  // 清空所有应用数据
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  }

  // 获取所有数据
  getAll() {
    try {
      const data = {};
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const cleanKey = key.replace(this.prefix, '');
          data[cleanKey] = this.load(cleanKey);
        }
      });
      return data;
    } catch (error) {
      console.error('获取所有数据失败:', error);
      return {};
    }
  }

  // 检查存储空间
  getStorageInfo() {
    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          totalSize += localStorage.getItem(key).length;
        }
      });

      return {
        totalSize: totalSize,
        totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
        itemCount: keys.filter(key => key.startsWith(this.prefix)).length
      };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return { totalSize: 0, totalSizeKB: 0, itemCount: 0 };
    }
  }
}

// 创建单例实例
const storageManager = new StorageManager();

// 导出常用方法
export const storage = {
  // 事件相关
  saveEvents: (events) => storageManager.save('events', events),
  loadEvents: () => storageManager.load('events', []),
  
  // 设置相关
  saveSettings: (settings) => storageManager.save('settings', settings),
  loadSettings: () => storageManager.load('settings', {}),
  
  // 主题相关
  saveTheme: (theme) => storageManager.save('theme', theme),
  loadTheme: () => storageManager.load('theme', 'light'),
  
  // 通用方法
  save: (key, data) => storageManager.save(key, data),
  load: (key, defaultValue) => storageManager.load(key, defaultValue),
  remove: (key) => storageManager.remove(key),
  clear: () => storageManager.clear(),
  getAll: () => storageManager.getAll(),
  getStorageInfo: () => storageManager.getStorageInfo()
};

export default storage;