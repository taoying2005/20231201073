// 全局错误处理和兼容性检查脚本

// 错误记录配置
const ERROR_CONFIG = {
    logLevel: 'warn', // 'error', 'warn', 'info'
    showNotifications: true,
    collectErrors: true,
    maxErrorsStored: 50
};

// 存储错误信息
let errorStore = [];

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 设置全局错误处理器
    setupGlobalErrorHandlers();
    
    // 检查浏览器兼容性
    checkBrowserCompatibility();
    
    // 初始化错误通知系统
    initErrorNotifications();
    
    // 检查控制台是否开放（生产环境安全检查）
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        checkDevToolsOpen();
    }
    
    // 添加网络请求监控
    monitorNetworkRequests();
    
    // 添加资源加载错误监控
    monitorResourceLoading();
});

// 设置全局错误处理器
function setupGlobalErrorHandlers() {
    // 捕获JavaScript错误
    window.addEventListener('error', function(e) {
        logError('JavaScript错误', e.error, {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno
        });
        
        // 阻止默认错误处理（可选）
        // return true;
    });
    
    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', function(e) {
        logError('Promise拒绝', e.reason, {
            promise: e.promise,
            eventType: e.type
        });
    });
    
    // 捕获资源加载错误
    window.addEventListener('error', function(e) {
        if (e.target instanceof HTMLElement) {
            const element = e.target;
            if (element.tagName === 'IMG' || 
                element.tagName === 'SCRIPT' || 
                element.tagName === 'LINK' || 
                element.tagName === 'AUDIO' || 
                element.tagName === 'VIDEO') {
                logError('资源加载错误', e, {
                    resourceType: element.tagName.toLowerCase(),
                    src: element.src || element.href,
                    id: element.id,
                    className: element.className
                });
            }
        }
    }, true);
    
    console.log('✓ 全局错误处理器已设置');
}

// 错误日志记录
function logError(title, error, extraInfo = {}) {
    const errorObj = {
        title,
        message: error ? (error.message || String(error)) : '未知错误',
        stack: error ? (error.stack || '无堆栈信息') : '无堆栈信息',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...extraInfo
    };
    
    // 存储错误信息
    if (ERROR_CONFIG.collectErrors) {
        if (errorStore.length >= ERROR_CONFIG.maxErrorsStored) {
            errorStore.shift(); // 移除最旧的错误
        }
        errorStore.push(errorObj);
    }
    
    // 根据日志级别输出
    switch(ERROR_CONFIG.logLevel) {
        case 'error':
            console.error(`[错误] ${title}:`, errorObj);
            break;
        case 'warn':
            console.warn(`[警告] ${title}:`, errorObj);
            break;
        case 'info':
            console.info(`[信息] ${title}:`, errorObj);
            break;
    }
    
    // 显示用户通知
    if (ERROR_CONFIG.showNotifications && title !== '资源加载错误') {
        showUserNotification(`发生${title}，请刷新页面重试`, 'error');
    }
    
    // 这里可以添加错误上报逻辑
    // reportErrorToServer(errorObj);
}

// 检查浏览器兼容性
function checkBrowserCompatibility() {
    const compatibilityIssues = [];
    
    // 检查关键API支持
    const requiredFeatures = [
        { name: 'fetch API', check: 'fetch' in window },
        { name: 'Promise', check: 'Promise' in window },
        { name: 'querySelector', check: 'querySelector' in document },
        { name: 'classList', check: 'classList' in document.createElement('div') },
        { name: 'localStorage', check: () => {
            try { return 'localStorage' in window && window.localStorage !== null; }
            catch(e) { return false; }
        }},
        { name: 'requestAnimationFrame', check: 'requestAnimationFrame' in window },
        { name: 'addEventListener', check: 'addEventListener' in window }
    ];
    
    requiredFeatures.forEach(feature => {
        const isSupported = typeof feature.check === 'function' ? feature.check() : feature.check;
        if (!isSupported) {
            compatibilityIssues.push(`不支持${feature.name}`);
        }
    });
    
    // 检查浏览器版本
    const browserInfo = getBrowserInfo();
    const isOutdated = checkIfOutdated(browserInfo);
    
    if (isOutdated) {
        compatibilityIssues.push(`您的浏览器版本(${browserInfo.name} ${browserInfo.version})可能不兼容，建议升级`);
    }
    
    // 显示兼容性问题
    if (compatibilityIssues.length > 0) {
        console.warn('浏览器兼容性问题:');
        compatibilityIssues.forEach(issue => console.warn(`- ${issue}`));
        
        // 向用户显示通知
        showUserNotification(
            '您的浏览器可能不完全兼容本网站功能，建议升级到最新版本',
            'warning'
        );
    } else {
        console.log('✓ 浏览器兼容性检查通过');
    }
}

// 获取浏览器信息
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = { name: '未知', version: '0.0.0' };
    
    if (ua.indexOf('MSIE') !== -1 || ua.indexOf('Trident/') !== -1) {
        browser.name = 'Internet Explorer';
        browser.version = ua.match(/MSIE\s(\d+\.\d+)|rv:(\d+\.\d+)/)[1] || '';
    } else if (ua.indexOf('Edge/') !== -1) {
        browser.name = 'Microsoft Edge';
        browser.version = ua.match(/Edge\/(\d+\.\d+)/)[1];
    } else if (ua.indexOf('Firefox/') !== -1) {
        browser.name = 'Firefox';
        browser.version = ua.match(/Firefox\/(\d+\.\d+)/)[1];
    } else if (ua.indexOf('Chrome/') !== -1) {
        browser.name = 'Chrome';
        browser.version = ua.match(/Chrome\/(\d+\.\d+)/)[1];
    } else if (ua.indexOf('Safari/') !== -1 && ua.indexOf('Chrome/') === -1) {
        browser.name = 'Safari';
        browser.version = ua.match(/Safari\/(\d+\.\d+)/)[1];
    }
    
    return browser;
}

// 检查浏览器是否过时
function checkIfOutdated(browserInfo) {
    const minVersions = {
        'Chrome': 80,
        'Firefox': 75,
        'Safari': 13,
        'Microsoft Edge': 80,
        'Internet Explorer': 12 // IE任何版本都视为过时
    };
    
    const minVersion = minVersions[browserInfo.name];
    if (!minVersion) return false;
    
    const currentVersion = parseFloat(browserInfo.version) || 0;
    return currentVersion < minVersion;
}

// 初始化错误通知系统
function initErrorNotifications() {
    // 创建通知容器
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'error-notification-container';
    notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 350px;
    `;
    document.body.appendChild(notificationContainer);
}

// 显示用户通知
function showUserNotification(message, type = 'info') {
    const container = document.getElementById('error-notification-container');
    if (!container) return;
    
    // 创建通知元素
    const notification = document.createElement('div');
    
    // 设置样式
    let bgColor, textColor, icon;
    switch(type) {
        case 'error':
            bgColor = '#f8d7da';
            textColor = '#721c24';
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            bgColor = '#fff3cd';
            textColor = '#856404';
            icon = 'fa-exclamation-triangle';
            break;
        case 'success':
            bgColor = '#d4edda';
            textColor = '#155724';
            icon = 'fa-check-circle';
            break;
        default:
            bgColor = '#d1ecf1';
            textColor = '#0c5460';
            icon = 'fa-info-circle';
    }
    
    notification.style.cssText = `
        background-color: ${bgColor};
        color: ${textColor};
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideInRight 0.3s ease-out;
        display: flex;
        align-items: center;
    `;
    
    // 添加内容
    notification.innerHTML = `
        <i class="fa ${icon} mr-3"></i>
        <span>${message}</span>
        <button class="ml-auto text-gray-500 hover:text-gray-700" style="background: none; border: none; cursor: pointer;">
            <i class="fa fa-times"></i>
        </button>
    `;
    
    // 添加到容器
    container.appendChild(notification);
    
    // 关闭按钮事件
    const closeBtn = notification.querySelector('button');
    closeBtn.addEventListener('click', function() {
        removeNotification(notification);
    });
    
    // 自动关闭
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
}

// 移除通知
function removeNotification(notification) {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// 检查开发者工具是否开放
function checkDevToolsOpen() {
    // 这是一个简单的检测方法，在某些情况下可能不准确
    let devToolsOpen = false;
    
    // 监听按键组合
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
            devToolsOpen = true;
            logDevToolsOpen();
        }
    });
    
    // 其他检测方法可以在这里添加
}

// 记录开发者工具开放
function logDevToolsOpen() {
    logError('开发者工具', '检测到用户打开开发者工具', {
        page: window.location.href,
        timestamp: new Date().toISOString()
    });
    
    // 在生产环境中可以考虑额外的安全措施
    console.warn('警告: 请勿在生产环境中修改代码');
}

// 监控网络请求
function monitorNetworkRequests() {
    // 监控fetch请求
    const originalFetch = window.fetch;
    window.fetch = function() {
        const startTime = performance.now();
        return originalFetch.apply(this, arguments)
            .then(response => {
                const endTime = performance.now();
                const url = arguments[0];
                const duration = endTime - startTime;
                
                if (!response.ok) {
                    logError('网络请求失败', response.statusText, {
                        url,
                        status: response.status,
                        duration: `${duration.toFixed(2)}ms`
                    });
                } else if (duration > 3000) {
                    console.warn(`网络请求较慢: ${url} (${duration.toFixed(2)}ms)`);
                }
                
                return response;
            })
            .catch(error => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                const url = arguments[0];
                
                logError('网络请求异常', error, {
                    url,
                    duration: `${duration.toFixed(2)}ms`
                });
                
                throw error;
            });
    };
    
    // 监控XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this._startTime = performance.now();
        this._url = arguments[1];
        
        // 监听加载完成
        this.addEventListener('loadend', function() {
            const endTime = performance.now();
            const duration = endTime - this._startTime;
            
            if (this.status >= 400) {
                logError('XHR请求失败', `HTTP ${this.status}`, {
                    url: this._url,
                    status: this.status,
                    statusText: this.statusText,
                    duration: `${duration.toFixed(2)}ms`
                });
            } else if (duration > 3000) {
                console.warn(`XHR请求较慢: ${this._url} (${duration.toFixed(2)}ms)`);
            }
        });
        
        return originalXHROpen.apply(this, arguments);
    };
    
    console.log('✓ 网络请求监控已启用');
}

// 监控资源加载
function monitorResourceLoading() {
    // 图片加载错误处理
    document.querySelectorAll('img').forEach(img => {
        // 如果图片已经加载失败，处理它
        if (!img.complete || img.naturalWidth === 0) {
            handleImageError(img);
        }
        
        // 添加错误事件处理
        img.addEventListener('error', function() {
            handleImageError(this);
        });
    });
    
    // CSS加载错误处理
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        link.addEventListener('error', function() {
            logError('样式表加载失败', this.href, {
                type: 'stylesheet',
                href: this.href
            });
            
            // 尝试加载备用样式
            const fallbackLink = document.createElement('link');
            fallbackLink.rel = 'stylesheet';
            fallbackLink.href = '/assets/css/fallback.css';
            document.head.appendChild(fallbackLink);
        });
    });
    
    // JavaScript加载错误处理
    document.querySelectorAll('script[src]').forEach(script => {
        script.addEventListener('error', function() {
            logError('脚本加载失败', this.src, {
                type: 'script',
                src: this.src
            });
        });
    });
}

// 处理图片加载错误
function handleImageError(img) {
    // 记录错误
    logError('图片加载失败', img.src, {
        type: 'image',
        src: img.src,
        alt: img.alt || '无替代文本'
    });
    
    // 显示占位图片
    const placeholderSrc = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20150%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15e9e396e2e%20text%20%7B%20fill%3A%23AAA%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15e9e396e2e%22%3E%3Crect%20width%3D%22200%22%20height%3D%22150%22%20fill%3D%22%23F5F5F5%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2274%22%20y%3D%2281%22%3E图片加载失败%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
    
    // 只有在未设置过占位图时才设置，避免无限循环
    if (!img.dataset.originalSrc) {
        img.dataset.originalSrc = img.src;
        img.src = placeholderSrc;
        img.classList.add('image-placeholder');
        img.title = '图片加载失败，点击重试';
        
        // 添加点击重试功能
        img.addEventListener('click', function() {
            this.src = this.dataset.originalSrc;
            this.classList.remove('image-placeholder');
        });
    }
}

// 暴露给全局的错误处理方法
window.handleError = function(error, context = {}) {
    logError('自定义错误', error, context);
    return true;
};

window.showNotification = showUserNotification;

// 提供错误报告功能
window.getErrorLog = function() {
    return errorStore;
};

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.image-placeholder {
    filter: grayscale(100%);
    cursor: pointer;
    transition: filter 0.3s ease;
}

.image-placeholder:hover {
    filter: grayscale(50%);
}
}
`;
document.head.appendChild(style);