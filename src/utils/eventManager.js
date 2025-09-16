// 事件管理类
import { storage } from './storage.js';
import DateUtils from './dateUtils.js';

export class EventManager {
  constructor() {
    this.events = this.loadEvents();
    this.listeners = [];
  }

  // 加载事件
  loadEvents() {
    return storage.loadEvents();
  }

  // 保存事件
  saveEvents() {
    return storage.saveEvents(this.events);
  }

  // 添加事件
  addEvent(event) {
    const newEvent = {
      id: this.generateId(),
      title: event.title || '',
      date: event.date,
      time: event.time || '',
      type: event.type || 'todo',
      description: event.description || '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.events.push(newEvent);
    this.saveEvents();
    this.notifyListeners('add', newEvent);
    return newEvent;
  }

  // 更新事件
  updateEvent(id, updates) {
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) return null;

    const updatedEvent = {
      ...this.events[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.events[index] = updatedEvent;
    this.saveEvents();
    this.notifyListeners('update', updatedEvent);
    return updatedEvent;
  }

  // 删除事件
  deleteEvent(id) {
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) return false;

    const deletedEvent = this.events[index];
    this.events.splice(index, 1);
    this.saveEvents();
    this.notifyListeners('delete', deletedEvent);
    return true;
  }

  // 获取事件
  getEvent(id) {
    return this.events.find(event => event.id === id);
  }

  // 获取所有事件
  getAllEvents() {
    return [...this.events];
  }

  // 根据日期获取事件
  getEventsByDate(date) {
    const targetDate = DateUtils.formatDate(date, 'YYYY-MM-DD');
    return this.events.filter(event => {
      const eventDate = DateUtils.formatDate(event.date, 'YYYY-MM-DD');
      return eventDate === targetDate;
    });
  }

  // 根据月份获取事件
  getEventsByMonth(year, month) {
    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && 
             eventDate.getMonth() + 1 === month;
    });
  }

  // 获取今日事件
  getTodayEvents() {
    const today = DateUtils.getCurrentDate();
    return this.getEventsByDate(today);
  }

  // 获取即将到期的事件
  getUpcomingEvents(days = 7) {
    const today = DateUtils.getCurrentDate();
    const futureDate = DateUtils.addDays(today, days);
    
    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= futureDate;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // 获取过期事件
  getOverdueEvents() {
    const today = DateUtils.getCurrentDate();
    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < today && !event.completed;
    });
  }

  // 标记事件为完成
  toggleEventComplete(id) {
    const event = this.getEvent(id);
    if (!event) return null;

    return this.updateEvent(id, { completed: !event.completed });
  }

  // 搜索事件
  searchEvents(query) {
    const lowerQuery = query.toLowerCase();
    return this.events.filter(event => 
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery)
    );
  }

  // 按类型获取事件
  getEventsByType(type) {
    return this.events.filter(event => event.type === type);
  }

  // 获取事件统计
  getEventStats() {
    const total = this.events.length;
    const completed = this.events.filter(event => event.completed).length;
    const pending = total - completed;
    const overdue = this.getOverdueEvents().length;
    const today = this.getTodayEvents().length;

    return {
      total,
      completed,
      pending,
      overdue,
      today,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 添加事件监听器
  addEventListener(callback) {
    this.listeners.push(callback);
  }

  // 移除事件监听器
  removeEventListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // 通知监听器
  notifyListeners(action, event) {
    this.listeners.forEach(callback => {
      try {
        callback(action, event, this.events);
      } catch (error) {
        console.error('事件监听器错误:', error);
      }
    });
  }

  // 清空所有事件
  clearAllEvents() {
    this.events = [];
    this.saveEvents();
    this.notifyListeners('clear', null);
  }

  // 导入事件
  importEvents(events) {
    if (!Array.isArray(events)) return false;

    const importedEvents = events.map(event => ({
      ...event,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    this.events.push(...importedEvents);
    this.saveEvents();
    this.notifyListeners('import', importedEvents);
    return true;
  }

  // 导出事件
  exportEvents() {
    return {
      events: this.events,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // 检查提醒
  checkReminders() {
    const now = new Date();
    const currentTime = DateUtils.formatDate(now, 'HH:mm');
    const today = DateUtils.formatDate(now, 'YYYY-MM-DD');

    const reminders = this.events.filter(event => {
      if (event.completed) return false;
      
      const eventDate = DateUtils.formatDate(event.date, 'YYYY-MM-DD');
      const eventTime = event.time;
      
      // 检查是否是今天的事件
      if (eventDate === today && eventTime) {
        // 检查时间是否匹配（允许5分钟的误差）
        const eventMinutes = this.timeToMinutes(eventTime);
        const currentMinutes = this.timeToMinutes(currentTime);
        return Math.abs(eventMinutes - currentMinutes) <= 5;
      }
      
      return false;
    });

    return reminders;
  }

  // 时间转换为分钟
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

// 创建单例实例
const eventManager = new EventManager();

export default eventManager;