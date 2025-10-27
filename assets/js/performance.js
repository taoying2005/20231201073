// 页面性能优化和测试脚本

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 仅在开发环境运行，生产环境可移除
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('开始性能优化检查...');
        
        // 执行各项优化检查
        checkImageOptimization();
        checkJavaScriptPerformance();
        checkCSSOptimization();
        checkResponsiveDesign();
        analyzePageLoad();
        checkAccessibility();
    }
    
    // 始终运行的性能优化
    optimizeFontLoading();
    optimizeImageLoading();
    enableLazyLoading();
    optimizeCriticalCSS();
});

// 图片优化检查
function checkImageOptimization() {
    const images = document.querySelectorAll('img');
    let unoptimizedImages = [];
    
    images.forEach((img, index) => {
        // 检查图片大小
        if (img.naturalWidth > window.innerWidth * 2 || img.naturalHeight > window.innerHeight * 2) {
            unoptimizedImages.push({
                src: img.src,
                issue: '图片尺寸过大',
                suggestion: `当前尺寸: ${img.naturalWidth}x${img.naturalHeight}, 建议根据显示区域优化`
            });
        }
        
        // 检查图片格式
        const imgExtension = img.src.split('.').pop().toLowerCase();
        if (!['webp', 'avif'].includes(imgExtension) && img.naturalWidth > 300) {
            unoptimizedImages.push({
                src: img.src,
                issue: '图片格式非最优',
                suggestion: '建议使用WebP或AVIF格式以减小文件大小'
            });
        }
        
        // 检查是否有alt属性
        if (!img.alt && !img.hasAttribute('aria-label')) {
            unoptimizedImages.push({
                src: img.src,
                issue: '缺少替代文本',
                suggestion: '请添加alt属性以提高可访问性'
            });
        }
    });
    
    if (unoptimizedImages.length > 0) {
        console.warn(`检测到 ${unoptimizedImages.length} 张需要优化的图片:`);
        unoptimizedImages.forEach(img => {
            console.warn(`- ${img.src}: ${img.issue} - ${img.suggestion}`);
        });
    } else {
        console.log('✓ 所有图片已优化');
    }
}

// JavaScript性能检查
function checkJavaScriptPerformance() {
    // 检查DOM元素数量
    const totalElements = document.querySelectorAll('*').length;
    if (totalElements > 1000) {
        console.warn(`页面DOM元素过多 (${totalElements}个)，可能影响渲染性能`);
    }
    
    // 检查是否有阻塞渲染的脚本
    const blockingScripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
    if (blockingScripts.length > 0) {
        console.warn(`检测到 ${blockingScripts.length} 个阻塞渲染的脚本，建议添加 async 或 defer 属性`);
    }
    
    // 检查事件监听器数量
    const eventListenersCount = getEventListenersCount();
    if (eventListenersCount > 50) {
        console.warn(`页面事件监听器过多 (${eventListenersCount}个)，考虑使用事件委托`);
    }
    
    console.log(`✓ JavaScript性能检查完成: DOM元素 ${totalElements} 个, 阻塞脚本 ${blockingScripts.length} 个`);
}

// CSS优化检查
function checkCSSOptimization() {
    // 检查未使用的CSS (简化版)
    const sheets = document.styleSheets;
    let totalRules = 0;
    
    for (let i = 0; i < sheets.length; i++) {
        try {
            if (sheets[i].cssRules) {
                totalRules += sheets[i].cssRules.length;
            }
        } catch (e) {
            // 跨域样式表可能无法访问
        }
    }
    
    if (totalRules > 1000) {
        console.warn(`CSS规则过多 (${totalRules}条)，建议检查并移除未使用的CSS`);
    }
    
    // 检查内联样式
    const elementsWithInlineStyle = document.querySelectorAll('[style]');
    if (elementsWithInlineStyle.length > 50) {
        console.warn(`内联样式元素过多 (${elementsWithInlineStyle.length}个)，建议使用CSS类`);
    }
    
    console.log(`✓ CSS优化检查完成: CSS规则 ${totalRules} 条, 内联样式 ${elementsWithInlineStyle.length} 个`);
}

// 响应式设计测试
function checkResponsiveDesign() {
    const breakpoints = [320, 768, 1024, 1440];
    const issues = [];
    
    // 检查viewport设置
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
        issues.push('缺少viewport meta标签');
    } else if (!viewportMeta.content.includes('width=device-width') || !viewportMeta.content.includes('initial-scale=1')) {
        issues.push('viewport设置不正确，可能影响移动端显示');
    }
    
    // 检查是否有响应式媒体查询
    let hasMediaQueries = false;
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const rules = document.styleSheets[i].cssRules;
            for (let j = 0; j < rules.length; j++) {
                if (rules[j].type === CSSRule.MEDIA_RULE) {
                    hasMediaQueries = true;
                    break;
                }
            }
        } catch (e) {
            // 跨域样式表可能无法访问
        }
    }
    
    if (!hasMediaQueries) {
        issues.push('未检测到媒体查询，可能缺少响应式设计');
    }
    
    if (issues.length > 0) {
        console.warn('响应式设计问题:');
        issues.forEach(issue => console.warn(`- ${issue}`));
    } else {
        console.log('✓ 响应式设计检查通过');
    }
    
    // 模拟不同设备宽度的测试提示
    console.log('建议在以下宽度测试响应式布局:');
    breakpoints.forEach(width => {
        console.log(`- ${width}px (${getDeviceType(width)})`);
    });
}

// 页面加载性能分析
function analyzePageLoad() {
    const perfData = {
        domLoading: performance.timing.domLoading,
        domComplete: performance.timing.domComplete,
        loadEventEnd: performance.timing.loadEventEnd,
        navigationStart: performance.timing.navigationStart
    };
    
    const domReadyTime = perfData.domComplete - perfData.domLoading;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    
    console.log('页面加载性能分析:');
    console.log(`- DOM解析完成时间: ${domReadyTime}ms`);
    console.log(`- 页面完全加载时间: ${pageLoadTime}ms`);
    
    if (pageLoadTime > 3000) {
        console.warn('页面加载时间超过3秒，建议优化');
    }
}

// 可访问性检查
function checkAccessibility() {
    const issues = [];
    
    // 检查页面标题
    const title = document.title;
    if (!title || title.length < 10) {
        issues.push('页面标题过短或缺失');
    }
    
    // 检查语义化标签使用
    const semanticTags = ['header', 'nav', 'main', 'section', 'article', 'footer', 'aside'];
    let semanticTagCount = 0;
    
    semanticTags.forEach(tag => {
        if (document.querySelector(tag)) {
            semanticTagCount++;
        }
    });
    
    if (semanticTagCount < 3) {
        issues.push('语义化HTML标签使用不足，建议使用header、main、footer等标签');
    }
    
    // 检查颜色对比度（简化版）
    const links = document.querySelectorAll('a:not([class])');
    links.forEach(link => {
        const computedStyle = window.getComputedStyle(link);
        const color = computedStyle.color;
        // 简单检查是否为蓝色系
        if (!color.includes('0, 0, 255') && !color.includes('0, 123, 255')) {
            issues.push('链接颜色可能不符合可访问性标准');
        }
    });
    
    if (issues.length > 0) {
        console.warn('可访问性问题:');
        issues.forEach(issue => console.warn(`- ${issue}`));
    } else {
        console.log('✓ 可访问性检查通过');
    }
}

// 字体加载优化
function optimizeFontLoading() {
    // 检查是否有字体预加载
    const fontPreloadLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
    
    if (fontPreloadLinks.length === 0 && document.querySelector('style:contains(@font-face)')) {
        // 这里可以动态添加字体预加载，但在实际生产环境中应在HTML中静态添加
        console.log('建议添加字体预加载以提高性能');
    }
    
    // 字体显示优化
    document.documentElement.style.fontDisplay = 'swap';
}

// 图片加载优化
function optimizeImageLoading() {
    // 为图片添加加载事件监听，统计加载时间
    const images = document.querySelectorAll('img');
    let loadedImages = 0;
    let totalLoadTime = 0;
    
    images.forEach(img => {
        const startTime = performance.now();
        
        if (img.complete) {
            loadedImages++;
            checkImageStatus();
        } else {
            img.addEventListener('load', function() {
                const loadTime = performance.now() - startTime;
                totalLoadTime += loadTime;
                loadedImages++;
                checkImageStatus();
            });
            
            img.addEventListener('error', function() {
                console.error(`图片加载失败: ${img.src}`);
                loadedImages++;
                checkImageStatus();
            });
        }
    });
    
    function checkImageStatus() {
        if (loadedImages === images.length && images.length > 0) {
            const avgLoadTime = totalLoadTime / images.length;
            console.log(`✓ 所有图片加载完成，平均加载时间: ${avgLoadTime.toFixed(2)}ms`);
        }
    }
}

// 启用懒加载
function enableLazyLoading() {
    // 检查是否支持原生懒加载
    const supportsLazyLoading = 'loading' in HTMLImageElement.prototype;
    
    if (supportsLazyLoading) {
        // 为不在视口中的图片添加懒加载
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            if (isElementInViewport(img)) {
                img.loading = 'eager';
            } else {
                img.loading = 'lazy';
            }
        });
        console.log(`✓ 已为 ${images.length} 张图片启用原生懒加载`);
    } else {
        // 回退到JavaScript懒加载实现
        console.log('浏览器不支持原生懒加载，建议添加懒加载库');
    }
}

// 关键CSS优化
function optimizeCriticalCSS() {
    // 检查是否有内联关键CSS
    const hasInlineCriticalCSS = document.querySelector('style[id="critical-css"]');
    
    if (!hasInlineCriticalCSS) {
        console.log('建议将关键CSS内联到HTML中以加快首屏渲染');
    }
    
    // 检查大型CSS文件是否有异步加载
    const largeStylesheets = [];
    
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const sheet = document.styleSheets[i];
            const href = sheet.href;
            
            if (href) {
                // 通过link元素检查大小
                const linkElement = document.querySelector(`link[href="${href}"]`);
                if (linkElement && linkElement.sheet && linkElement.sheet.cssRules && linkElement.sheet.cssRules.length > 500) {
                    largeStylesheets.push(href);
                }
            }
        } catch (e) {
            // 跨域样式表可能无法访问
        }
    }
    
    if (largeStylesheets.length > 0) {
        console.warn(`检测到大型样式表，建议拆分或异步加载:`);
        largeStylesheets.forEach(href => console.warn(`- ${href}`));
    }
}

// 辅助函数
function getDeviceType(width) {
    if (width <= 320) return '手机 (小型)';
    if (width <= 768) return '平板 (小型)';
    if (width <= 1024) return '平板 (大型)';
    return '桌面端';
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function getEventListenersCount() {
    // 这是一个简化版的事件监听器计数方法
    // 在实际应用中，可以使用更复杂的方法或浏览器开发工具
    let count = 0;
    const commonEvents = ['click', 'mouseover', 'mouseout', 'change', 'submit', 'keydown', 'keyup'];
    
    // 计算所有按钮和链接的点击事件监听器
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    count += interactiveElements.length; // 简化计算，假设每个交互元素至少有一个事件监听器
    
    return count;
}

// 添加自定义事件用于性能监控
document.addEventListener('performance-monitor', function(e) {
    console.log('性能监控:', e.detail);
});

// 定期监控内存使用情况（如果浏览器支持）
if (performance.memory) {
    setInterval(() => {
        const memoryInfo = performance.memory;
        console.log(`内存使用: ${(memoryInfo.usedJSHeapSize / 1048576).toFixed(2)}MB / ${(memoryInfo.totalJSHeapSize / 1048576).toFixed(2)}MB`);
    }, 5000);
}