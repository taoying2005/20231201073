/**
 * 通知组件 - 用于提供操作反馈
 */

class Notification {
    constructor() {
        // 确保只创建一个通知容器
        this.container = this._createContainer();
        this.notifications = [];
    }

    /**
     * 创建通知容器
     * @private
     * @returns {HTMLElement} 通知容器元素
     */
    _createContainer() {
        // 安全获取container，确保document.body存在
        if (!document || !document.body) {
            // 如果DOM未准备好，创建一个临时容器
            return document.createElement('div');
        }
        
        let container = document.querySelector('#notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-4 right-4 z-50 flex flex-col items-end space-y-4';
            try {
                document.body.appendChild(container);
            } catch (e) {
                console.warn('无法添加通知容器到DOM:', e);
            }
        }
        return container;
    }

    /**
     * 创建通知元素
     * @private
     * @param {string} type - 通知类型: info, success, warning, error
     * @param {string} message - 通知消息
     * @param {number} duration - 持续时间（毫秒）
     * @returns {HTMLElement} 通知元素
     */
    _createNotification(type, message, duration) {
        // 生成唯一ID
        const id = `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.id = id;
        
        // 设置基本样式
        notification.className = `notification max-w-md p-4 rounded-lg shadow-lg transform transition-all duration-500 ease-out flex items-start opacity-0 translate-y-[-20px] z-50`;
        
        // 设置类型相关样式和图标
        let iconClass = '';
        let bgColor = '';
        let textColor = '';
        
        switch (type) {
            case 'info':
                iconClass = 'fa-info-circle';
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-800';
                break;
            case 'success':
                iconClass = 'fa-check-circle';
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                break;
            case 'warning':
                iconClass = 'fa-exclamation-triangle';
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-800';
                break;
            case 'error':
                iconClass = 'fa-times-circle';
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
                break;
            default:
                iconClass = 'fa-info-circle';
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-800';
        }
        
        // 添加类型相关类
        notification.classList.add(...bgColor.split(' '), ...textColor.split(' '));
        
        // 设置通知内容
        notification.innerHTML = `
            <i class="fa ${iconClass} text-xl mr-3 mt-0.5"></i>
            <div class="flex-grow">
                <p class="text-sm leading-relaxed">${message}</p>
            </div>
            <button class="close-notification text-gray-500 hover:text-gray-700 ml-3 focus:outline-none">
                <i class="fa fa-times"></i>
            </button>
        `;
        
        // 添加到通知列表
        this.notifications.push({
            id,
            element: notification,
            timeout: null
        });
        
        // 关闭按钮事件
        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => this.close(id));
        
        // 点击通知也可以关闭
        notification.addEventListener('click', (e) => {
            if (e.target !== closeBtn && !closeBtn.contains(e.target)) {
                this.close(id);
            }
        });
        
        return notification;
    }

    /**
     * 显示通知
     * @param {string} type - 通知类型: info, success, warning, error
     * @param {string} message - 通知消息
     * @param {number} [duration=3000] - 持续时间（毫秒），默认3秒
     * @returns {string} 通知ID
     */
    show(type, message, duration = 3000) {
        const notification = this._createNotification(type, message, duration);
        
        // 添加到容器
        this.container.appendChild(notification);
        
        // 触发重排，以便动画能够正确执行
        void notification.offsetWidth;
        
        // 显示通知
        notification.classList.remove('opacity-0', 'translate-y-[-20px]');
        
        // 设置自动关闭计时器
        const notificationObj = this.notifications.find(n => n.id === notification.id);
        if (notificationObj) {
            notificationObj.timeout = setTimeout(() => {
                this.close(notification.id);
            }, duration);
        }
        
        return notification.id;
    }

    /**
     * 关闭指定通知
     * @param {string} id - 通知ID
     */
    close(id) {
        const notificationObj = this.notifications.find(n => n.id === id);
        if (!notificationObj) return;
        
        // 清除计时器
        clearTimeout(notificationObj.timeout);
        
        // 通知元素
        const notification = notificationObj.element;
        
        // 添加退场动画
        notification.classList.add('opacity-0', 'translate-y-[-20px]');
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (notification.parentNode === this.container) {
                this.container.removeChild(notification);
            }
            
            // 从列表中移除
            this.notifications = this.notifications.filter(n => n.id !== id);
        }, 500);
    }

    /**
     * 关闭所有通知
     */
    closeAll() {
        this.notifications.forEach(notificationObj => {
            clearTimeout(notificationObj.timeout);
            const notification = notificationObj.element;
            
            // 添加退场动画
            notification.classList.add('opacity-0', 'translate-y-[-20px]');
            
            // 动画结束后移除元素
            setTimeout(() => {
                if (notification.parentNode === this.container) {
                    this.container.removeChild(notification);
                }
            }, 500);
        });
        
        // 清空通知列表
        this.notifications = [];
    }

    /**
     * 显示信息通知
     * @param {string} message - 通知消息
     * @param {number} [duration=3000] - 持续时间（毫秒）
     * @returns {string} 通知ID
     */
    info(message, duration = 3000) {
        return this.show('info', message, duration);
    }

    /**
     * 显示成功通知
     * @param {string} message - 通知消息
     * @param {number} [duration=3000] - 持续时间（毫秒）
     * @returns {string} 通知ID
     */
    success(message, duration = 3000) {
        return this.show('success', message, duration);
    }

    /**
     * 显示警告通知
     * @param {string} message - 通知消息
     * @param {number} [duration=4000] - 持续时间（毫秒），警告默认持续时间更长
     * @returns {string} 通知ID
     */
    warning(message, duration = 4000) {
        return this.show('warning', message, duration);
    }

    /**
     * 显示错误通知
     * @param {string} message - 通知消息
     * @param {number} [duration=5000] - 持续时间（毫秒），错误默认持续时间最长
     * @returns {string} 通知ID
     */
    error(message, duration = 5000) {
        return this.show('error', message, duration);
    }
}

// 全局通知函数，提供简单的接口
window.showNotification = function(message, type = 'info', duration = 3000) {
    // 使用简单的alert作为后备方案
    alert(message);
};

// 导出为ES模块（如果环境支持）
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = notification;
}