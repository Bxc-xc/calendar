// 应用配置文件
export const appConfig = {
  // 应用基本信息
  app: {
    name: '桌面日历',
    version: '1.0.0',
    description: '轻量、美观、可自定义的桌面日历',
    author: 'Calendar Developer'
  },

  // 窗口配置
  window: {
    width: 400,
    height: 500,
    minWidth: 350,
    minHeight: 450,
    resizable: true,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    skipTaskbar: true
  },

  // 开发服务器配置
  devServer: {
    port: 5173,
    host: 'localhost'
  },

  // 主题配置
  themes: {
    light: {
      name: '简约',
      primaryColor: '#4A90E2',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      borderColor: '#E0E0E0'
    },
    dark: {
      name: '深色',
      primaryColor: '#6BB6FF',
      backgroundColor: '#2D2D2D',
      textColor: '#FFFFFF',
      borderColor: '#404040'
    },
    cartoon: {
      name: '卡通',
      primaryColor: '#FF6B9D',
      backgroundColor: '#FFF8E1',
      textColor: '#5D4037',
      borderColor: '#FFB74D'
    }
  },

  // 默认设置
  defaultSettings: {
    theme: 'light',
    fontSize: 14,
    opacity: 0.95,
    alwaysOnTop: true,
    showWeekends: true,
    enableNotifications: true,
    language: 'zh-CN'
  },

  // 事件类型配置
  eventTypes: {
    todo: {
      name: '待办',
      icon: '📝',
      color: '#FF6B6B'
    },
    reminder: {
      name: '提醒',
      icon: '🔔',
      color: '#4ECDC4'
    },
    birthday: {
      name: '生日',
      icon: '🎂',
      color: '#FFE66D'
    },
    holiday: {
      name: '节日',
      icon: '🎉',
      color: '#FF8B94'
    },
    meeting: {
      name: '会议',
      icon: '💼',
      color: '#A8E6CF'
    }
  },

  // 快捷键配置
  shortcuts: {
    toggleWindow: 'CommandOrControl+Shift+C',
    quit: 'CommandOrControl+Q'
  },

  // 存储配置
  storage: {
    eventsKey: 'calendar-events',
    settingsKey: 'calendar-settings',
    themeKey: 'calendar-theme'
  }
};

export default appConfig;