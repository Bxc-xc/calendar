// 日期工具类
export class DateUtils {
  // 获取当前日期
  static getCurrentDate() {
    return new Date();
  }

  // 格式化日期
  static formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  // 获取月份的第一天
  static getFirstDayOfMonth(year, month) {
    return new Date(year, month - 1, 1);
  }

  // 获取月份的最后一天
  static getLastDayOfMonth(year, month) {
    return new Date(year, month, 0);
  }

  // 获取月份的天数
  static getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  // 获取月份第一天是星期几（0-6，0是星期日）
  static getFirstDayOfWeek(year, month) {
    return new Date(year, month - 1, 1).getDay();
  }

  // 获取日历网格的日期数组
  static getCalendarDays(year, month) {
    const daysInMonth = this.getDaysInMonth(year, month);
    const firstDay = this.getFirstDayOfWeek(year, month);
    const days = [];

    // 添加上个月的末尾几天
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthDays = this.getDaysInMonth(prevYear, prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDays - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // 添加当前月的所有天
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = this.isToday(year, month, day);
      days.push({
        date: day,
        month: month,
        year: year,
        isCurrentMonth: true,
        isToday: isToday
      });
    }

    // 添加下个月的开头几天，填满6行
    const remainingDays = 42 - days.length; // 6行 × 7天 = 42天
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  }

  // 判断是否是今天
  static isToday(year, month, day) {
    const today = this.getCurrentDate();
    return today.getFullYear() === year &&
           today.getMonth() + 1 === month &&
           today.getDate() === day;
  }

  // 判断是否是周末
  static isWeekend(date) {
    const day = new Date(date).getDay();
    return day === 0 || day === 6; // 0是星期日，6是星期六
  }

  // 获取星期几的中文名称
  static getWeekdayName(dayIndex) {
    const names = ['日', '一', '二', '三', '四', '五', '六'];
    return names[dayIndex];
  }

  // 获取月份的中文名称
  static getMonthName(month) {
    const names = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    return names[month - 1];
  }

  // 比较两个日期
  static compareDates(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return d1.getTime() - d2.getTime();
  }

  // 判断两个日期是否是同一天
  static isSameDay(date1, date2) {
    return this.compareDates(date1, date2) === 0;
  }

  // 添加天数
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // 添加月份
  static addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  // 获取日期范围
  static getDateRange(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  // 获取农历信息（简化版）
  static getLunarInfo(date) {
    // 这里可以集成农历库，暂时返回空
    return {
      lunarMonth: '',
      lunarDay: '',
      lunarYear: '',
      zodiac: '',
      festival: ''
    };
  }

  // 获取节假日信息
  static getHolidayInfo(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 简单的节假日判断
    const holidays = {
      '1-1': '元旦',
      '2-14': '情人节',
      '3-8': '妇女节',
      '5-1': '劳动节',
      '6-1': '儿童节',
      '9-10': '教师节',
      '10-1': '国庆节',
      '12-25': '圣诞节'
    };

    const key = `${month}-${day}`;
    return holidays[key] || null;
  }
}

export default DateUtils;