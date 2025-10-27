// 通用动画和交互效果增强脚本

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 添加页面加载动画
    addPageLoadAnimation();
    
    // 添加平滑滚动
    addSmoothScrolling();
    
    // 添加元素悬停动画
    addHoverAnimations();
    
    // 添加模态框动画
    addModalAnimations();
    
    // 添加导航栏响应式增强
    enhanceNavbarResponsiveness();
    
    // 添加表单交互增强
    enhanceFormInteractions();
    
    // 添加列表项加载动画
    addListLoadAnimations();
    
    // 添加按钮点击反馈
    addButtonFeedback();
});

// 页面加载动画
function addPageLoadAnimation() {
    // 添加渐入效果
    document.body.classList.add('fade-in');
    
    // 页面标题动画
    const pageTitle = document.querySelector('h1, .page-title');
    if (pageTitle) {
        setTimeout(() => {
            pageTitle.classList.add('slide-in-left');
        }, 100);
    }
    
    // 内容区域动画
    const contentArea = document.querySelector('.content, main');
    if (contentArea) {
        setTimeout(() => {
            contentArea.classList.add('fade-in-up');
        }, 200);
    }
}

// 平滑滚动
function addSmoothScrolling() {
    // 为所有内部链接添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 元素悬停动画
function addHoverAnimations() {
    // 卡片悬停效果
    document.querySelectorAll('.card, .post-item, .user-card, .bar-card').forEach(card => {
        card.classList.add('hover-transition');
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // 按钮悬停效果增强
    document.querySelectorAll('button, a.btn').forEach(btn => {
        btn.classList.add('hover-scale');
    });
    
    // 导航项悬停效果
    document.querySelectorAll('.nav-item, .navbar-nav li a').forEach(item => {
        item.classList.add('hover-underline');
    });
    
    // 头像悬停效果
    document.querySelectorAll('.avatar, .user-avatar').forEach(avatar => {
        avatar.classList.add('hover-zoom');
    });
}

// 模态框动画
function addModalAnimations() {
    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('[data-toggle="modal"]');
    const modalCloses = document.querySelectorAll('.modal-close');
    
    // 显示模态框动画
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-target');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.querySelector('.modal-content').classList.add('modal-open');
                }, 10);
            }
        });
    });
    
    // 关闭模态框动画
    modalCloses.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            const modalContent = modal.querySelector('.modal-content');
            
            modalContent.classList.remove('modal-open');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        });
    });
    
    // 点击模态框外部关闭
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                const modalContent = this.querySelector('.modal-content');
                modalContent.classList.remove('modal-open');
                setTimeout(() => {
                    this.classList.add('hidden');
                }, 300);
            }
        });
    });
}

// 导航栏响应式增强
function enhanceNavbarResponsiveness() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    // 滚动效果增强
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.scrollY;
        
        // 向下滚动时隐藏导航栏，向上滚动时显示
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // 移动端菜单切换
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('open');
        });
    }
}

// 表单交互增强
function enhanceFormInteractions() {
    const formInputs = document.querySelectorAll('input, textarea, select');
    
    formInputs.forEach(input => {
        // 输入框聚焦效果
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('input-focused');
        });
        
        // 实时验证反馈
        if (input.hasAttribute('required')) {
            input.addEventListener('input', function() {
                validateInput(this);
            });
        }
    });
    
    // 表单提交动画
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // 只有在真实提交时才会阻止默认行为，模拟提交时不阻止
            if (this.dataset.preventDefault !== 'false') {
                e.preventDefault();
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i>提交中...';
                
                // 模拟表单提交延迟
                setTimeout(() => {
                    submitBtn.innerHTML = '<i class="fa fa-check mr-2"></i>提交成功';
                    submitBtn.classList.add('bg-green-500');
                    
                    // 重置表单
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                        submitBtn.classList.remove('bg-green-500');
                    }, 2000);
                }, 1500);
            }
        });
    });
}

// 输入验证
function validateInput(input) {
    const isValid = input.checkValidity();
    
    if (input.value.trim() === '') {
        input.classList.remove('input-valid', 'input-invalid');
    } else if (isValid) {
        input.classList.add('input-valid');
        input.classList.remove('input-invalid');
    } else {
        input.classList.add('input-invalid');
        input.classList.remove('input-valid');
    }
}

// 列表项加载动画
function addListLoadAnimations() {
    const listItems = document.querySelectorAll('.post-item, .comment-item, .user-item, .bar-item');
    
    // 逐项显示动画
    listItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 50 * (index % 10)); // 每10个一组，避免延迟过长
    });
    
    // 加载更多按钮动画
    const loadMoreBtn = document.querySelector('.load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i>加载中...';
            this.disabled = true;
            
            // 模拟加载延迟
            setTimeout(() => {
                this.innerHTML = '加载更多';
                this.disabled = false;
            }, 1500);
        });
    }
}

// 按钮点击反馈
function addButtonFeedback() {
    document.querySelectorAll('button, a.btn, .btn').forEach(btn => {
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// 初始化响应式布局检查
function checkResponsiveLayout() {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    // 添加设备类以支持特定设备的样式
    document.documentElement.classList.toggle('is-mobile', isMobile);
    document.documentElement.classList.toggle('is-tablet', isTablet);
    document.documentElement.classList.toggle('is-desktop', !isMobile && !isTablet);
}

// 监听窗口大小变化
window.addEventListener('resize', checkResponsiveLayout);
// 初始化检查
checkResponsiveLayout();