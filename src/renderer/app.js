// 桌面日历应用 JavaScript 文件
class DesktopCalendarWidget {
    constructor() {
        this.container = document.getElementById('widgetContainer');
        this.header = document.getElementById('widgetHeader');
        this.content = document.getElementById('widgetContent');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsOverlay = document.getElementById('settingsOverlay');
        this.scheduleModal = document.getElementById('scheduleModal');
        this.scheduleList = document.getElementById('scheduleList');
        
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.isMinimized = false;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.schedules = this.loadSchedules();
        this.editingSchedule = null;
        this.currentAnimation = 'ripple';
        this.showWeekends = true;
        this.showTodayHighlight = true;
        this.tourActive = false;
        this.tourStep = 0;
        this.tourSteps = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDateTime();
        this.renderCalendar();
        this.loadSettings();
        this.renderScheduleList();
        this.initTour();
        this.initializeLayout();
        
        // 每秒更新时间
        setInterval(() => this.updateDateTime(), 1000);
    }
    
    initializeLayout() {
        // 初始化布局
        const rect = this.container.getBoundingClientRect();
        this.updateLayoutForSize(rect.width, rect.height);
        
        // 确保内容区域正确显示
        setTimeout(() => {
            const content = this.content;
            if (content) {
                content.style.display = 'flex';
                content.style.flexDirection = 'column';
            }
        }, 100);
    }
    
    setupEventListeners() {
        // 拖拽功能
        this.header.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
        
        // 双击标题栏快速全屏/还原
        this.header.addEventListener('dblclick', () => this.toggleFullscreen());
        
        // 调整大小 - 四个角
        const resizeHandles = [
            { element: document.getElementById('resizeHandleSE'), direction: 'se' },
            { element: document.getElementById('resizeHandleSW'), direction: 'sw' },
            { element: document.getElementById('resizeHandleNE'), direction: 'ne' },
            { element: document.getElementById('resizeHandleNW'), direction: 'nw' }
        ];
        
        resizeHandles.forEach(handle => {
            handle.element.addEventListener('mousedown', (e) => this.startResize(e, handle.direction));
        });
        
        document.addEventListener('mousemove', (e) => this.resize(e));
        document.addEventListener('mouseup', () => this.stopResize());
        
        // 控制按钮
        document.getElementById('minimizeBtn').addEventListener('click', () => this.toggleMinimize());
        document.getElementById('closeBtn').addEventListener('click', () => this.close());
        document.getElementById('settingsBtn').addEventListener('click', () => this.toggleSettings());
        
        // 设置面板关闭按钮
        document.getElementById('settingsCloseBtn').addEventListener('click', () => this.closeSettings());
        
        // 点击遮罩层关闭设置面板
        document.getElementById('settingsOverlay').addEventListener('click', () => this.closeSettings());
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // F11 或 Ctrl+Shift+F 切换全屏
            if (e.key === 'F11' || (e.ctrlKey && e.shiftKey && e.key === 'F')) {
                e.preventDefault();
                this.toggleFullscreen();
            }
            // ESC 退出全屏
            if (e.key === 'Escape' && this.container.classList.contains('fullscreen-mode')) {
                this.exitFullscreen();
            }
        });
        
        // 月份导航
        document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));
        
        // 设置面板 - 实时同步
        document.getElementById('opacitySlider').addEventListener('input', (e) => {
            this.setOpacity(e.target.value);
            document.getElementById('opacityValue').textContent = Math.round(e.target.value * 100) + '%';
        });
        
        // 实时预览透明度变化
        document.getElementById('opacitySlider').addEventListener('mousemove', (e) => {
            if (e.buttons === 1) { // 鼠标按下时
                this.setOpacity(e.target.value);
                document.getElementById('opacityValue').textContent = Math.round(e.target.value * 100) + '%';
            }
        });
        
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setSize(e.target.dataset.size));
        });
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setTheme(e.target.dataset.theme));
        });
        
        document.querySelectorAll('.animation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setAnimation(e.target.dataset.animation));
        });
        
        document.getElementById('showWeekends').addEventListener('change', (e) => this.toggleWeekends(e.target.checked));
        document.getElementById('showToday').addEventListener('change', (e) => this.toggleTodayHighlight(e.target.checked));
        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());
        
        // 引导功能
        document.getElementById('tourNext').addEventListener('click', () => this.nextTourStep());
        document.getElementById('tourPrev').addEventListener('click', () => this.prevTourStep());
        document.getElementById('tourSkip').addEventListener('click', () => this.skipTour());
        document.getElementById('startTourBtn').addEventListener('click', () => this.restartTour());
        document.getElementById('clearTourBtn').addEventListener('click', () => this.clearTourRecord());
        
        // 日程管理事件
        document.getElementById('addScheduleBtn').addEventListener('click', () => this.openScheduleModal());
        document.getElementById('modalClose').addEventListener('click', () => this.closeScheduleModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeScheduleModal());
        document.getElementById('scheduleForm').addEventListener('submit', (e) => this.saveSchedule(e));
        
        // 优先级选择
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectPriority(e.target));
        });
        
        // 点击模态框外部关闭
        this.scheduleModal.addEventListener('click', (e) => {
            if (e.target === this.scheduleModal) {
                this.closeScheduleModal();
            }
        });
    }
    
    // 拖拽功能
    startDrag(e) {
        // 在 Electron 环境中，拖拽由 CSS -webkit-app-region: drag 处理
        if (window.electronAPI) {
            return;
        }
        
        // 在非 Electron 环境中的拖拽逻辑
        this.isDragging = true;
        this.container.classList.add('dragging');
        const rect = this.container.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        e.preventDefault();
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        // 在 Electron 环境中，拖拽由原生处理
        if (window.electronAPI) {
            return;
        }
        
        // 在非 Electron 环境中的拖拽逻辑
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const maxX = screenWidth - this.container.offsetWidth;
        const maxY = screenHeight - this.container.offsetHeight;
        
        this.container.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        this.container.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
        this.container.style.right = 'auto';
    }
    
    stopDrag() {
        this.isDragging = false;
        this.container.classList.remove('dragging');
        this.savePosition();
    }
    
    // 调整大小功能
    startResize(e, direction) {
        this.isResizing = true;
        this.resizeDirection = direction;
        this.container.classList.add('resizing');
        e.preventDefault();
        
        const rect = this.container.getBoundingClientRect();
        this.resizeStart = {
            x: e.clientX,
            y: e.clientY,
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top
        };
        
        document.body.style.userSelect = 'none';
    }
    
    resize(e) {
        if (!this.isResizing || !this.resizeStart || !this.resizeDirection) return;
        
        const deltaX = e.clientX - this.resizeStart.x;
        const deltaY = e.clientY - this.resizeStart.y;
        
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        
        const minWidth = 250;
        const minHeight = 200;
        const maxWidth = screenWidth;
        const maxHeight = screenHeight;
        
        let newWidth = this.resizeStart.width;
        let newHeight = this.resizeStart.height;
        let newLeft = this.resizeStart.left;
        let newTop = this.resizeStart.top;
        
        switch (this.resizeDirection) {
            case 'se': // 右下角
                newWidth = Math.max(minWidth, Math.min(this.resizeStart.width + deltaX, maxWidth));
                newHeight = Math.max(minHeight, Math.min(this.resizeStart.height + deltaY, maxHeight));
                break;
                
            case 'sw': // 左下角
                newWidth = Math.max(minWidth, Math.min(this.resizeStart.width - deltaX, maxWidth));
                newHeight = Math.max(minHeight, Math.min(this.resizeStart.height + deltaY, maxHeight));
                newLeft = this.resizeStart.left + (this.resizeStart.width - newWidth);
                break;
                
            case 'ne': // 右上角
                newWidth = Math.max(minWidth, Math.min(this.resizeStart.width + deltaX, maxWidth));
                newHeight = Math.max(minHeight, Math.min(this.resizeStart.height - deltaY, maxHeight));
                newTop = this.resizeStart.top + (this.resizeStart.height - newHeight);
                break;
                
            case 'nw': // 左上角
                newWidth = Math.max(minWidth, Math.min(this.resizeStart.width - deltaX, maxWidth));
                newHeight = Math.max(minHeight, Math.min(this.resizeStart.height - deltaY, maxHeight));
                newLeft = this.resizeStart.left + (this.resizeStart.width - newWidth);
                newTop = this.resizeStart.top + (this.resizeStart.height - newHeight);
                break;
        }
        
        this.container.style.width = newWidth + 'px';
        this.container.style.height = newHeight + 'px';
        
        // 如果不是全屏模式，保持当前位置
        if (!this.container.classList.contains('fullscreen-mode')) {
            this.container.style.position = 'fixed';
            this.container.style.transform = '';
            this.container.style.right = 'auto';
            this.container.style.margin = '0';
            // 保持当前位置，不改变 left 和 top
        } else {
            this.container.style.left = newLeft + 'px';
            this.container.style.top = newTop + 'px';
            this.container.style.right = 'auto';
        }
        
        this.updateLayoutForSize(newWidth, newHeight);
    }
    
    stopResize() {
        if (!this.isResizing) return;
        
        this.isResizing = false;
        this.resizeDirection = null;
        this.container.classList.remove('resizing');
        this.resizeStart = null;
        
        document.body.style.userSelect = '';
        
        const rect = this.container.getBoundingClientRect();
        const newWidth = Math.round(rect.width);
        const newHeight = Math.round(rect.height);
        
        // 请求主进程调整窗口大小
        if (window.electronAPI && window.electronAPI.resizeWindow) {
            window.electronAPI.resizeWindow(newWidth, newHeight).then(result => {
                if (result.success) {
                    console.log(`窗口大小已调整为: ${newWidth} × ${newHeight}`);
                }
            }).catch(error => {
                console.error('调整窗口大小失败:', error);
            });
        }
        
        this.saveSettings();
        this.showNotification(`尺寸已调整为: ${newWidth} × ${newHeight}`);
    }
    
    updateLayoutForSize(width, height) {
        const content = this.content;
        if (!content) return;
        
        // 确保内容区域有足够的高度
        if (height && height > 0) {
            content.style.height = `${height - 60}px`;
            content.style.maxHeight = `${height - 60}px`;
        } else {
            content.style.height = 'calc(100% - 60px)';
            content.style.maxHeight = 'calc(100% - 60px)';
        }
        
        if (width > 500) {
            content.style.fontSize = '15px';
            content.style.padding = '20px';
        } else if (width > 400) {
            content.style.fontSize = '14px';
            content.style.padding = '18px';
        } else if (width > 300) {
            content.style.fontSize = '13px';
            content.style.padding = '15px';
        } else {
            content.style.fontSize = '12px';
            content.style.padding = '12px';
        }
        
        const calendar = document.getElementById('miniCalendar');
        if (calendar) {
            if (width > 600) {
                calendar.style.fontSize = '16px';
                calendar.style.marginTop = '20px';
            } else if (width > 500) {
                calendar.style.fontSize = '15px';
                calendar.style.marginTop = '18px';
            } else if (width > 350) {
                calendar.style.fontSize = '13px';
                calendar.style.marginTop = '15px';
            } else {
                calendar.style.fontSize = '12px';
                calendar.style.marginTop = '10px';
            }
        }
        
        const currentDate = document.getElementById('currentDate');
        const currentTime = document.getElementById('currentTime');
        if (currentDate && currentTime) {
            if (width > 500) {
                currentDate.style.fontSize = '18px';
                currentTime.style.fontSize = '16px';
            } else if (width > 350) {
                currentDate.style.fontSize = '16px';
                currentTime.style.fontSize = '14px';
            } else {
                currentDate.style.fontSize = '14px';
                currentTime.style.fontSize = '12px';
            }
        }
        
        const monthNav = document.querySelector('.month-nav');
        if (monthNav) {
            if (width > 500) {
                monthNav.style.padding = '12px 15px';
                monthNav.style.marginBottom = '20px';
            } else if (width > 350) {
                monthNav.style.padding = '10px 12px';
                monthNav.style.marginBottom = '15px';
            } else {
                monthNav.style.padding = '8px 10px';
                monthNav.style.marginBottom = '10px';
            }
        }
        
        const scheduleSection = document.querySelector('.schedule-section');
        if (scheduleSection) {
            if (width > 500) {
                scheduleSection.style.marginTop = '25px';
                scheduleSection.style.paddingTop = '20px';
            } else if (width > 350) {
                scheduleSection.style.marginTop = '20px';
                scheduleSection.style.paddingTop = '15px';
            } else {
                scheduleSection.style.marginTop = '15px';
                scheduleSection.style.paddingTop = '15px';
            }
        }
    }
    
    // 其他方法...
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.container.classList.toggle('minimized', this.isMinimized);
    }
    
    close() {
        // 请求主进程关闭窗口
        if (window.electronAPI && window.electronAPI.closeWindow) {
            window.electronAPI.closeWindow();
        } else {
            // 如果没有 Electron API，则隐藏容器
            this.container.style.display = 'none';
        }
    }
    
    toggleSettings() {
        const isShowing = this.settingsPanel.classList.contains('show');
        if (isShowing) {
            this.closeSettings();
        } else {
            this.openSettings();
        }
    }
    
    openSettings() {
        this.settingsPanel.classList.add('show');
        this.settingsOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    closeSettings() {
        this.settingsPanel.classList.remove('show');
        this.settingsOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    setOpacity(value) {
        const overlayOpacity = Math.max(0.2, value * 0.5);
        this.container.style.background = `url('bkg.jpg') center 30% / cover no-repeat, linear-gradient(135deg, rgba(255, 255, 255, ${overlayOpacity}), rgba(248, 248, 248, ${overlayOpacity * 0.8}))`;
        this.saveSettings();
    }
    
    setSize(size) {
        document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-size="${size}"]`).classList.add('active');
        
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        
        const sizes = {
            small: { width: 280, height: 450 },
            medium: { width: 350, height: 600 },
            large: { width: 500, height: 700 },
            fullscreen: { 
                width: screenWidth, 
                height: screenHeight,
                position: { left: '0px', top: '0px' }
            }
        };
        
        const newSize = sizes[size];
        
        // 设置容器样式
        this.container.style.width = newSize.width + 'px';
        this.container.style.height = newSize.height + 'px';
        
        if (size === 'fullscreen') {
            // 全屏模式特殊处理
            this.container.style.left = '0px';
            this.container.style.top = '0px';
            this.container.style.right = 'auto';
            this.container.style.margin = '0';
            this.container.style.position = 'fixed';
            this.container.style.transform = '';
        } else {
            // 其他尺寸保持当前位置，不强制居中
            this.container.style.position = 'fixed';
            this.container.style.transform = '';
            this.container.style.right = 'auto';
            this.container.style.margin = '0';
            // 保持当前位置，不改变 left 和 top
        }
        
        // 请求主进程调整窗口大小
        if (window.electronAPI && window.electronAPI.resizeWindow) {
            window.electronAPI.resizeWindow(newSize.width, newSize.height).then(result => {
                if (result.success) {
                    console.log(`窗口大小已调整为: ${newSize.width} × ${newSize.height}`);
                }
            }).catch(error => {
                console.error('调整窗口大小失败:', error);
            });
        }
        
        this.updateLayoutForSize(newSize.width, newSize.height);
        
        setTimeout(() => {
            this.updateLayoutForSize(newSize.width, newSize.height);
        }, 50);
        
        this.saveSettings();
        
        if (size === 'fullscreen') {
            this.showNotification('已切换到全屏模式');
        } else {
            this.showNotification(`已切换到${size === 'small' ? '小' : size === 'medium' ? '中' : '大'}尺寸`);
        }
    }
    
    toggleFullscreen() {
        const rect = this.container.getBoundingClientRect();
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        
        const isFullscreen = rect.width >= (screenWidth - 50) && rect.height >= (screenHeight - 50);
        
        if (isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }
    
    enterFullscreen() {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        
        this.container.style.width = screenWidth + 'px';
        this.container.style.height = screenHeight + 'px';
        this.container.style.left = '0px';
        this.container.style.top = '0px';
        this.container.style.right = 'auto';
        this.container.style.margin = '0';
        this.container.style.position = 'fixed';
        
        // 请求主进程调整窗口大小到全屏
        if (window.electronAPI && window.electronAPI.resizeWindow) {
            window.electronAPI.resizeWindow(screenWidth, screenHeight).then(result => {
                if (result.success) {
                    console.log(`窗口已调整为全屏: ${screenWidth} × ${screenHeight}`);
                }
            }).catch(error => {
                console.error('调整窗口到全屏失败:', error);
            });
        }
        
        this.container.classList.add('fullscreen-mode');
        this.updateLayoutForSize(screenWidth, screenHeight);
        
        document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-size="fullscreen"]').classList.add('active');
        
        this.showNotification('已进入全屏模式 - 双击标题栏可退出');
        this.saveSettings();
    }
    
    exitFullscreen() {
        this.container.classList.remove('fullscreen-mode');
        
        // 重置定位样式，但不强制居中
        this.container.style.position = 'fixed';
        this.container.style.transform = '';
        this.container.style.right = 'auto';
        this.container.style.margin = '0';
        // 保持当前位置，不改变 left 和 top
        
        this.setSize('medium');
        this.showNotification('已退出全屏模式');
    }
    
    setTheme(theme) {
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
        
        const themes = {
            light: { bg: `url('bkg.jpg') center 30% / cover no-repeat, linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(248, 248, 248, 0.5))`, color: '#333' },
            dark: { bg: `url('bkg.jpg') center 30% / cover no-repeat, linear-gradient(135deg, rgba(44, 62, 80, 0.6), rgba(30, 40, 50, 0.5))`, color: '#ecf0f1' },
            blue: { bg: `url('bkg.jpg') center 30% / cover no-repeat, linear-gradient(135deg, rgba(52, 152, 219, 0.6), rgba(41, 128, 185, 0.5))`, color: '#fff' },
            green: { bg: `url('bkg.jpg') center 30% / cover no-repeat, linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(248, 248, 248, 0.5))`, color: '#333' }
        };
        
        const newTheme = themes[theme];
        this.container.style.background = newTheme.bg;
        this.container.style.color = newTheme.color;
        this.saveSettings();
    }
    
    setAnimation(animation) {
        document.querySelectorAll('.animation-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-animation="${animation}"]`).classList.add('active');
        this.currentAnimation = animation;
        this.saveSettings();
    }
    
    toggleWeekends(show) {
        this.showWeekends = show;
        this.renderCalendar();
        this.saveSettings();
    }
    
    toggleTodayHighlight(show) {
        this.showTodayHighlight = show;
        this.renderCalendar();
        this.saveSettings();
    }
    
    resetSettings() {
        document.getElementById('opacitySlider').value = 0.95;
        document.getElementById('opacityValue').textContent = '95%';
        this.setOpacity(0.95);
        
        this.setSize('small');
        this.setTheme('light');
        this.setAnimation('ripple');
        
        document.getElementById('showWeekends').checked = true;
        document.getElementById('showToday').checked = true;
        this.showWeekends = true;
        this.showTodayHighlight = true;
        
        // 重置为默认位置
        this.container.style.position = 'fixed';
        this.container.style.left = '50px';
        this.container.style.top = '50px';
        this.container.style.transform = '';
        this.container.style.right = 'auto';
        this.container.style.margin = '0';
        
        this.renderCalendar();
        this.saveSettings();
        this.showNotification('设置已重置');
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 12px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    // 日历相关方法
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }
    
    updateDateTime() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });
        const timeStr = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        document.getElementById('currentDate').textContent = dateStr;
        document.getElementById('currentTime').textContent = timeStr;
    }
    
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];
        const monthClasses = ['january', 'february', 'march', 'april', 'may', 'june',
                            'july', 'august', 'september', 'october', 'november', 'december'];
        
        document.querySelectorAll('.month-nav').forEach(nav => {
            monthClasses.forEach(cls => nav.classList.remove(cls));
        });
        
        const monthNav = document.querySelector('.month-nav');
        monthNav.classList.add(monthClasses[month]);
        
        document.querySelector('.month-text').textContent = `${year}年${monthNames[month]}`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const calendarBody = document.getElementById('calendarBody');
        calendarBody.innerHTML = '';
        
        const today = new Date();
        
        for (let week = 0; week < 6; week++) {
            const row = document.createElement('tr');
            
            for (let day = 0; day < 7; day++) {
                const cell = document.createElement('td');
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + week * 7 + day);
                
                cell.textContent = currentDate.getDate();
                cell.classList.add('ripple');
                
                if (currentDate.getMonth() !== month) {
                    cell.classList.add('other-month');
                }
                
                if (day === 0 || day === 6) {
                    cell.classList.add('weekend');
                    if (!this.showWeekends) {
                        cell.style.display = 'none';
                    }
                }
                
                if (currentDate.toDateString() === today.toDateString()) {
                    if (this.showTodayHighlight) {
                        cell.classList.add('today');
                    }
                }
                
                const dateStr = currentDate.toISOString().split('T')[0];
                const hasSchedule = this.schedules.some(s => s.date === dateStr);
                if (hasSchedule) {
                    cell.classList.add('has-schedule');
                }
                
                cell.addEventListener('click', () => {
                    this.selectDate(currentDate, cell);
                });
                
                row.appendChild(cell);
            }
            
            calendarBody.appendChild(row);
        }
    }
    
    selectDate(date, cell) {
        document.querySelectorAll('.clicked-date').forEach(c => {
            c.classList.remove('clicked-date');
        });
        
        cell.classList.add('clicked-date');
        this.createRippleEffect(cell);
        this.selectedDate = new Date(date);
        this.renderScheduleList();
        
        console.log('选择的日期:', date.toLocaleDateString('zh-CN'));
    }
    
    createRippleEffect(cell) {
        const existingRipple = cell.querySelector('.ripple-effect');
        if (existingRipple) {
            existingRipple.remove();
        }
        
        if (this.currentAnimation === 'ripple') {
            this.createRippleAnimation(cell);
        } else if (this.currentAnimation === 'pulse') {
            this.createPulseAnimation(cell);
        } else if (this.currentAnimation === 'bounce') {
            this.createBounceAnimation(cell);
        }
    }
    
    createRippleAnimation(cell) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        cell.appendChild(ripple);
        
        setTimeout(() => {
            ripple.classList.add('animate');
        }, 10);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }
    
    createPulseAnimation(cell) {
        cell.classList.add('pulse');
        setTimeout(() => {
            cell.classList.remove('pulse');
        }, 500);
    }
    
    createBounceAnimation(cell) {
        cell.classList.add('bounce');
        setTimeout(() => {
            cell.classList.remove('bounce');
        }, 600);
    }
    
    // 设置相关方法
    saveSettings() {
        const settings = {
            opacity: document.getElementById('opacitySlider').value,
            size: document.querySelector('.size-btn.active').dataset.size,
            theme: document.querySelector('.theme-btn.active').dataset.theme,
            animation: this.currentAnimation,
            showWeekends: this.showWeekends,
            showTodayHighlight: this.showTodayHighlight,
            position: {
                left: this.container.style.left,
                top: this.container.style.top
            },
            dimensions: {
                width: this.container.style.width,
                height: this.container.style.height
            }
        };
        
        localStorage.setItem('desktopCalendarSettings', JSON.stringify(settings));
    }
    
    savePosition() {
        const settings = JSON.parse(localStorage.getItem('desktopCalendarSettings') || '{}');
        settings.position = {
            left: this.container.style.left,
            top: this.container.style.top
        };
        localStorage.setItem('desktopCalendarSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('desktopCalendarSettings') || '{}');
        
        if (settings.opacity) {
            document.getElementById('opacitySlider').value = settings.opacity;
            document.getElementById('opacityValue').textContent = Math.round(settings.opacity * 100) + '%';
            this.setOpacity(settings.opacity);
        }
        
        if (settings.size) {
            this.setSize(settings.size);
        }
        
        if (settings.theme) {
            this.setTheme(settings.theme);
        }
        
        if (settings.animation) {
            this.setAnimation(settings.animation);
        }
        
        if (settings.showWeekends !== undefined) {
            this.showWeekends = settings.showWeekends;
            document.getElementById('showWeekends').checked = settings.showWeekends;
        }
        
        if (settings.showTodayHighlight !== undefined) {
            this.showTodayHighlight = settings.showTodayHighlight;
            document.getElementById('showToday').checked = settings.showTodayHighlight;
        }
        
        if (settings.position) {
            // 应用保存的位置
            if (!this.container.classList.contains('fullscreen-mode')) {
                this.container.style.position = 'fixed';
                this.container.style.left = settings.position.left;
                this.container.style.top = settings.position.top;
                this.container.style.transform = '';
                this.container.style.right = 'auto';
                this.container.style.margin = '0';
            } else {
                this.container.style.left = settings.position.left;
                this.container.style.top = settings.position.top;
                this.container.style.right = 'auto';
            }
        }
        
        if (settings.dimensions) {
            this.container.style.width = settings.dimensions.width;
            this.container.style.height = settings.dimensions.height;
            
            // 从保存的尺寸中提取数值并调整窗口大小
            const width = parseInt(settings.dimensions.width);
            const height = parseInt(settings.dimensions.height);
            
            if (!isNaN(width) && !isNaN(height) && window.electronAPI && window.electronAPI.resizeWindow) {
                window.electronAPI.resizeWindow(width, height).then(result => {
                    if (result.success) {
                        console.log(`从设置加载窗口大小: ${width} × ${height}`);
                    }
                }).catch(error => {
                    console.error('从设置调整窗口大小失败:', error);
                });
            }
        }
    }
    
    // 日程管理方法
    loadSchedules() {
        const saved = localStorage.getItem('desktopCalendarSchedules');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveSchedules() {
        localStorage.setItem('desktopCalendarSchedules', JSON.stringify(this.schedules));
    }
    
    openScheduleModal(schedule = null) {
        this.editingSchedule = schedule;
        const modal = this.scheduleModal;
        const form = document.getElementById('scheduleForm');
        
        if (schedule) {
            document.getElementById('modalTitle').textContent = '编辑日程';
            document.getElementById('scheduleTitle').value = schedule.title;
            document.getElementById('scheduleDate').value = schedule.date;
            document.getElementById('scheduleTime').value = schedule.time || '';
            document.getElementById('scheduleDescription').value = schedule.description || '';
            
            document.querySelectorAll('.priority-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.priority === schedule.priority) {
                    btn.classList.add('active');
                }
            });
        } else {
            document.getElementById('modalTitle').textContent = '添加日程';
            form.reset();
            document.querySelector('.priority-btn[data-priority="low"]').classList.add('active');
            document.querySelectorAll('.priority-btn:not([data-priority="low"])').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const dateStr = this.selectedDate.toISOString().split('T')[0];
            document.getElementById('scheduleDate').value = dateStr;
        }
        
        modal.classList.add('show');
    }
    
    closeScheduleModal() {
        this.scheduleModal.classList.remove('show');
        this.editingSchedule = null;
        document.getElementById('scheduleForm').reset();
    }
    
    selectPriority(btn) {
        document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    
    saveSchedule(e) {
        e.preventDefault();
        
        const formData = {
            id: this.editingSchedule ? this.editingSchedule.id : Date.now(),
            title: document.getElementById('scheduleTitle').value,
            date: document.getElementById('scheduleDate').value,
            time: document.getElementById('scheduleTime').value,
            description: document.getElementById('scheduleDescription').value,
            priority: document.querySelector('.priority-btn.active').dataset.priority,
            completed: this.editingSchedule ? this.editingSchedule.completed : false,
            createdAt: this.editingSchedule ? this.editingSchedule.createdAt : new Date().toISOString()
        };
        
        if (this.editingSchedule) {
            const index = this.schedules.findIndex(s => s.id === this.editingSchedule.id);
            if (index !== -1) {
                this.schedules[index] = formData;
            }
        } else {
            this.schedules.push(formData);
        }
        
        this.saveSchedules();
        this.renderCalendar();
        this.renderScheduleList();
        this.closeScheduleModal();
        this.showNotification('日程保存成功！');
    }
    
    renderScheduleList() {
        const dateStr = this.selectedDate.toISOString().split('T')[0];
        const daySchedules = this.schedules.filter(s => s.date === dateStr);
        
        if (daySchedules.length === 0) {
            this.scheduleList.innerHTML = '<div class="no-schedules">暂无日程安排</div>';
            return;
        }
        
        daySchedules.sort((a, b) => {
            if (!a.time && !b.time) return 0;
            if (!a.time) return 1;
            if (!b.time) return -1;
            return a.time.localeCompare(b.time);
        });
        
        this.scheduleList.innerHTML = daySchedules.map(schedule => `
            <div class="schedule-item ${schedule.completed ? 'completed' : ''}" data-id="${schedule.id}">
                <div class="schedule-info">
                    <div class="schedule-title">${schedule.title}</div>
                    <div class="schedule-time">${schedule.time ? schedule.time : '全天'}</div>
                </div>
                <div class="schedule-actions">
                    <button class="schedule-action-btn complete-btn" onclick="widget.toggleScheduleComplete(${schedule.id})" title="完成/未完成">✓</button>
                    <button class="schedule-action-btn edit-btn" onclick="widget.openScheduleModal(widget.schedules.find(s => s.id === ${schedule.id}))" title="编辑">✎</button>
                    <button class="schedule-action-btn delete-btn" onclick="widget.deleteSchedule(${schedule.id})" title="删除">×</button>
                </div>
            </div>
        `).join('');
    }
    
    toggleScheduleComplete(id) {
        const schedule = this.schedules.find(s => s.id === id);
        if (schedule) {
            schedule.completed = !schedule.completed;
            this.saveSchedules();
            this.renderScheduleList();
            this.renderCalendar();
        }
    }
    
    deleteSchedule(id) {
        if (confirm('确定要删除这个日程吗？')) {
            this.schedules = this.schedules.filter(s => s.id !== id);
            this.saveSchedules();
            this.renderScheduleList();
            this.renderCalendar();
            this.showNotification('日程已删除');
        }
    }
    
    // 引导功能
    initTour() {
        const hasSeenTour = localStorage.getItem('desktopCalendarTourSeen');
        if (!hasSeenTour) {
            this.startTour();
        }
        
        this.tourSteps = [
            {
                target: '#widgetContainer',
                title: '欢迎使用桌面日历！',
                description: '这是一个功能强大的桌面日历应用，可以帮助您管理日程和查看日期。',
                position: 'bottom'
            },
            {
                target: '.calendar-mini',
                title: '日历视图',
                description: '这里显示当前月份的日历，点击任意日期可以查看该日的日程安排。',
                position: 'top'
            },
            {
                target: '#addScheduleBtn',
                title: '添加日程',
                description: '点击这个按钮可以添加新的日程安排，支持设置时间、优先级等。',
                position: 'left'
            },
            {
                target: '#settingsBtn',
                title: '设置面板',
                description: '点击设置按钮可以自定义外观、动画效果、显示选项等。',
                position: 'left'
            },
            {
                target: '.month-nav',
                title: '月份导航',
                description: '使用左右箭头可以切换不同的月份，查看历史或未来的日期。',
                position: 'bottom'
            },
            {
                target: '#widgetHeader',
                title: '拖拽移动',
                description: '您可以拖拽标题栏来移动应用到桌面的任意位置。',
                position: 'bottom'
            }
        ];
    }
    
    startTour() {
        this.tourActive = true;
        this.tourStep = 0;
        this.showTourStep();
    }
    
    showTourStep() {
        if (!this.tourActive || this.tourStep >= this.tourSteps.length) {
            this.endTour();
            return;
        }
        
        const step = this.tourSteps[this.tourStep];
        const target = document.querySelector(step.target);
        
        if (!target) {
            this.nextTourStep();
            return;
        }
        
        const overlay = document.getElementById('tourOverlay');
        overlay.classList.add('show');
        
        target.classList.add('tour-highlight');
        this.createSpotlight(target);
        this.updateTooltip(step);
        this.positionTooltip(target, step.position);
    }
    
    createSpotlight(target) {
        const rect = target.getBoundingClientRect();
        const spotlight = document.getElementById('tourSpotlight');
        
        const size = Math.max(rect.width, rect.height) + 20;
        const x = rect.left + rect.width / 2 - size / 2;
        const y = rect.top + rect.height / 2 - size / 2;
        
        spotlight.style.width = size + 'px';
        spotlight.style.height = size + 'px';
        spotlight.style.left = x + 'px';
        spotlight.style.top = y + 'px';
    }
    
    updateTooltip(step) {
        document.getElementById('tourTitle').textContent = step.title;
        document.getElementById('tourDescription').textContent = step.description;
        document.getElementById('tourProgress').textContent = `${this.tourStep + 1} / ${this.tourSteps.length}`;
        
        const prevBtn = document.getElementById('tourPrev');
        const nextBtn = document.getElementById('tourNext');
        
        prevBtn.style.display = this.tourStep > 0 ? 'block' : 'none';
        nextBtn.textContent = this.tourStep === this.tourSteps.length - 1 ? '完成' : '下一步';
    }
    
    positionTooltip(target, position) {
        const rect = target.getBoundingClientRect();
        const tooltip = document.getElementById('tourTooltip');
        
        tooltip.classList.remove('top', 'bottom', 'left', 'right');
        tooltip.classList.add(position);
        
        let x, y;
        
        switch (position) {
            case 'top':
                x = rect.left + rect.width / 2;
                y = rect.top - 20;
                tooltip.style.left = x + 'px';
                tooltip.style.top = y + 'px';
                tooltip.style.transform = 'translate(-50%, -100%)';
                break;
            case 'bottom':
                x = rect.left + rect.width / 2;
                y = rect.bottom + 20;
                tooltip.style.left = x + 'px';
                tooltip.style.top = y + 'px';
                tooltip.style.transform = 'translate(-50%, 0)';
                break;
            case 'left':
                x = rect.left - 20;
                y = rect.top + rect.height / 2;
                tooltip.style.left = x + 'px';
                tooltip.style.top = y + 'px';
                tooltip.style.transform = 'translate(-100%, -50%)';
                break;
            case 'right':
                x = rect.right + 20;
                y = rect.top + rect.height / 2;
                tooltip.style.left = x + 'px';
                tooltip.style.top = y + 'px';
                tooltip.style.transform = 'translate(0, -50%)';
                break;
        }
        
        setTimeout(() => {
            tooltip.classList.add('show');
        }, 100);
    }
    
    nextTourStep() {
        this.hideCurrentStep();
        this.tourStep++;
        setTimeout(() => {
            this.showTourStep();
        }, 300);
    }
    
    prevTourStep() {
        this.hideCurrentStep();
        this.tourStep--;
        setTimeout(() => {
            this.showTourStep();
        }, 300);
    }
    
    hideCurrentStep() {
        const overlay = document.getElementById('tourOverlay');
        const tooltip = document.getElementById('tourTooltip');
        
        tooltip.classList.remove('show');
        
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });
        
        setTimeout(() => {
            overlay.classList.remove('show');
        }, 300);
    }
    
    skipTour() {
        this.endTour();
    }
    
    endTour() {
        this.tourActive = false;
        this.hideCurrentStep();
        
        localStorage.setItem('desktopCalendarTourSeen', 'true');
        this.showNotification('引导完成！现在您可以开始使用日历了。');
    }
    
    restartTour() {
        localStorage.removeItem('desktopCalendarTourSeen');
        this.settingsPanel.classList.remove('show');
        this.startTour();
    }
    
    clearTourRecord() {
        localStorage.removeItem('desktopCalendarTourSeen');
        this.showNotification('引导记录已清除，下次刷新页面将重新显示引导');
    }
}

// 初始化小部件
let widget;
document.addEventListener('DOMContentLoaded', () => {
    widget = new DesktopCalendarWidget();
});