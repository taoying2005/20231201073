// 全局功能管理

// 动态加载通知组件脚本
function loadNotificationScript() {
    const script = document.createElement('script');
    script.src = 'assets/notification.js';
    document.head.appendChild(script);
    
    // 等待通知组件加载完成
    return new Promise((resolve) => {
        script.onload = () => {
            resolve(window.notification);
        };
        
        // 如果脚本已加载（在已加载页面中重新执行）
        if (window.notification) {
            resolve(window.notification);
        }
    });
}

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isGuest = localStorage.getItem('isGuest') === 'true';
    const username = localStorage.getItem('username');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // 检查是否正在访问管理员页面，但不是管理员
    if (isLoggedIn && window.location.pathname.includes('admin.html') && !isAdmin) {
        // 尝试使用通知组件
        if (window.notification) {
            window.notification.error('您没有权限访问管理中心！');
        } else {
            alert('您没有权限访问管理中心！');
        }
        window.location.href = 'index.html';
        return { isLoggedIn, username, isAdmin: false, isGuest };
    }
    
    // 检查是否是登录页或注册页
    const isLoginPage = window.location.pathname.includes('login.html');
    const isRegisterPage = window.location.pathname.includes('register.html');
    
    // 如果不是登录/注册页且未登录（也不是游客），重定向到登录页
    if (!isLoggedIn && !isGuest && !isLoginPage && !isRegisterPage) {
        // 不需要提示，直接重定向到登录页
        window.location.href = 'login.html';
        return { isLoggedIn: false, username: null, isAdmin: false, isGuest: false };
    }
    
    // 检查未登录用户是否访问需要登录的页面
    if (!isLoggedIn && !isGuest) {
        const protectedPages = [
            'create-post.html',
            'admin.html',
            'user.html',
            'collections.html',
            'settings.html',
            'message.html'
        ];
        
        const currentPath = window.location.pathname;
        const isProtected = protectedPages.some(page => currentPath.includes(page));
        
        if (isProtected) {
            // 尝试使用通知组件
            if (window.notification) {
                window.notification.warning('请先登录后再访问该页面');
            } else {
                alert('请先登录后再访问该页面');
            }
            window.location.href = 'login.html';
            return { isLoggedIn: false, username: null, isAdmin: false, isGuest: false };
        }
    }
    
    // 更新导航栏的用户状态
    updateNavbarLoginStatus(isLoggedIn, username, isAdmin, isGuest);
    
    return { isLoggedIn, username, isAdmin, isGuest };
}

// 更新导航栏的登录状态显示
function updateNavbarLoginStatus(isLoggedIn, username, isAdmin, isGuest) {
    // 查找用户操作区域（新结构）
    const userLoginSection = document.querySelector('.flex.items-center.space-x-4');
    if (userLoginSection) {
        // 获取现有的用户菜单或登录按钮
        const userMenu = userLoginSection.querySelector('.relative.group');
        const loginBtn = userLoginSection.querySelector('#login-btn');
        
        if (isLoggedIn) {
            // 已登录状态
            if (!userMenu && !loginBtn) {
                // 添加用户菜单
                const userMenuHTML = `
                    <a href="message.html" class="relative text-gray-700 hover:text-primary transition-all-300">
                        <i class="fa fa-bell-o text-xl"></i>
                        <span class="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center">3</span>
                    </a>
                    <a href="create-post.html" class="hidden md:flex items-center bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full transition-all-300">
                        <i class="fa fa-plus mr-2"></i>
                        <span>发帖</span>
                    </a>
                    <div class="relative group">
                        <button class="flex items-center space-x-1 focus:outline-none">
                            <img src="https://picsum.photos/id/1005/40/40" alt="用户头像" class="w-8 h-8 rounded-full object-cover border-2 border-primary">
                            <i class="fa fa-angle-down text-gray-700 group-hover:text-primary transition-all-300"></i>
                        </button>
                        <!-- 下拉菜单 -->
                        <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 hidden group-hover:block">
                            <a href="user.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-all-300">
                                <i class="fa fa-user-o mr-2"></i>个人中心
                            </a>
                            <a href="collections.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-all-300">
                                <i class="fa fa-bookmark-o mr-2"></i>我的收藏
                            </a>
                            <a href="message.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-all-300">
                                <i class="fa fa-envelope-o mr-2"></i>消息通知
                            </a>
                            <a href="settings.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-all-300">
                                <i class="fa fa-cog mr-2"></i>账号设置
                            </a>
                            ${isAdmin ? `<a href="admin.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-all-300">
                                <i class="fa fa-tachometer mr-2"></i>管理中心
                            </a>` : ''}
                            <div class="border-t border-gray-200 my-1"></div>
                            <a href="#" id="logout-button" class="block px-4 py-2 text-sm text-danger hover:bg-gray-100 transition-all-300">
                                <i class="fa fa-sign-out mr-2"></i>退出登录
                            </a>
                        </div>
                    </div>
                `;
                userLoginSection.insertAdjacentHTML('beforeend', userMenuHTML);
            }
            
            // 确保有登出事件
            const logoutBtn = document.getElementById('logout-button');
            if (logoutBtn) {
                // 移除可能存在的旧事件监听器
                logoutBtn.removeEventListener('click', logout);
                // 添加新的事件监听器
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
        } else if (isGuest) {
            // 游客登录状态
            if (userMenu) {
                // 移除用户菜单
                userMenu.remove();
            }
            
            if (!loginBtn) {
                // 添加游客菜单
                const guestMenuHTML = `
                    <div class="relative group">
                        <button class="flex items-center space-x-1 focus:outline-none">
                            <img src="https://picsum.photos/id/1012/40/40" alt="游客头像" class="w-8 h-8 rounded-full object-cover border-2 border-gray-300">
                            <i class="fa fa-angle-down text-gray-700 group-hover:text-primary transition-all-300"></i>
                        </button>
                        <!-- 游客下拉菜单 -->
                        <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 hidden group-hover:block">
                            <a href="login.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-all-300">
                                <i class="fa fa-sign-in mr-2"></i>登录账号
                            </a>
                            <a href="register.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-all-300">
                                <i class="fa fa-user-plus mr-2"></i>注册账号
                            </a>
                            <div class="border-t border-gray-200 my-1"></div>
                            <a href="#" id="guest-logout-button" class="block px-4 py-2 text-sm text-danger hover:bg-gray-100 transition-all-300">
                                <i class="fa fa-sign-out mr-2"></i>退出游客模式
                            </a>
                        </div>
                    </div>
                `;
                userLoginSection.insertAdjacentHTML('beforeend', guestMenuHTML);
            }
            
            // 确保有游客登出事件
            const guestLogoutBtn = document.getElementById('guest-logout-button');
            if (guestLogoutBtn) {
                guestLogoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
        } else {
            // 未登录状态
            if (userMenu) {
                // 移除用户菜单
                userMenu.remove();
            }
            
            if (!loginBtn) {
                // 添加登录/注册按钮
                const loginRegisterHTML = `
                    <a href="login.html" id="login-btn" class="border border-primary text-primary hover:bg-primary/5 px-4 py-2 rounded-full transition-all-300">
                        登录
                    </a>
                    <a href="register.html" class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full transition-all-300">
                        注册
                    </a>
                `;
                userLoginSection.insertAdjacentHTML('beforeend', loginRegisterHTML);
            }
        }
    }
    
    // 兼容旧结构
    const userActions = document.getElementById('user-actions');
    if (userActions) {
        if (isLoggedIn) {
            // 已登录状态
            userActions.innerHTML = `
                <a href="message.html" class="relative text-gray-600 hover:text-primary transition-all-300">
                    <i class="fa fa-bell-o text-xl"></i>
                    <span class="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
                </a>
                <a href="user.html" class="flex items-center space-x-2">
                    <img src="https://picsum.photos/id/1005/40/40" alt="用户头像" class="w-8 h-8 rounded-full object-cover">
                    <span class="hidden md:inline text-sm font-medium">${username || '用户'}</span>
                </a>
                ${isAdmin ? '<a href="admin.html" class="text-gray-600 hover:text-primary transition-all-300 ml-2 admin-link"><i class="fa fa-cog text-xl"></i></a>' : ''}
                <button id="logout-button" class="text-gray-600 hover:text-primary transition-all-300 ml-2">
                    <i class="fa fa-sign-out"></i>
                </button>
            `;
            
            // 添加登出事件
            document.getElementById('logout-button')?.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        } else if (isGuest) {
            // 游客登录状态
            userActions.innerHTML = `
                <div class="flex items-center space-x-2">
                    <img src="https://picsum.photos/id/1012/40/40" alt="游客头像" class="w-8 h-8 rounded-full object-cover border border-gray-300">
                    <span class="hidden md:inline text-sm font-medium text-gray-600">游客</span>
                </div>
                <button id="guest-logout-button" class="text-gray-600 hover:text-primary transition-all-300 ml-2">
                    <i class="fa fa-sign-out"></i>
                </button>
            `;
            
            // 添加游客登出事件
            document.getElementById('guest-logout-button')?.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        } else {
            // 未登录状态
            userActions.innerHTML = `
                <a href="login.html" class="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-all-300">
                    登录
                </a>
                <a href="register.html" class="ml-2 border border-primary text-primary px-4 py-2 rounded-full hover:bg-primary/5 transition-all-300">
                    注册
                </a>
            `;
        }
    }
}

// 登出功能
function logout() {
    // 清除所有登录相关状态
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isGuest');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    
    // 尝试使用通知组件
    if (window.notification) {
        window.notification.success('已成功退出');
    } else {
        console.log('已成功退出');
    }
    
    // 重定向到登录页
    window.location.href = 'login.html';
}

// 导航栏滚动效果
function setupNavbarScrollEffect() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('py-1');
            navbar.classList.add('shadow-md');
        } else {
            navbar.classList.remove('py-1');
            navbar.classList.remove('shadow-md');
        }
    });
}

// 搜索功能
function setupSearchFunctionality() {
    const searchInput = document.querySelector('input[placeholder="搜索帖子、用户、贴吧"]');
    const searchButton = searchInput?.nextElementSibling;
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', function() {
            const keyword = searchInput.value.trim();
            if (keyword) {
                window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const keyword = searchInput.value.trim();
                if (keyword) {
                    window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
                }
            }
        });
    }
}

// 点赞功能
async function setupLikeFunctionality() {
    document.querySelectorAll('.fa-thumbs-o-up').forEach(button => {
        button.parentElement.addEventListener('click', async function() {
            // 检查登录状态
            const loginStatus = checkLoginStatus();
            if (!loginStatus.isLoggedIn) {
                window.location.href = 'login.html';
                return;
            }
            
            const icon = this.querySelector('i');
            const countElement = this.querySelector('span');
            
            if (icon.classList.contains('text-primary')) {
                // 取消点赞
                icon.classList.remove('text-primary');
                countElement.textContent = parseInt(countElement.textContent) - 1;
                
                // 尝试使用通知组件
                try {
                    await loadNotificationScript();
                    if (window.notification) {
                        window.notification.info('已取消点赞');
                    }
                } catch (e) {
                    console.log('已取消点赞');
                }
            } else {
                // 点赞
                icon.classList.add('text-primary');
                countElement.textContent = parseInt(countElement.textContent) + 1;
                
                // 尝试使用通知组件
                try {
                    await loadNotificationScript();
                    if (window.notification) {
                        window.notification.success('点赞成功');
                    }
                } catch (e) {
                    console.log('点赞成功');
                }
            }
        });
    });
}

// 评论功能
async function setupCommentFunctionality() {
    // 跳转到评论区
    document.querySelectorAll('.fa-comment-o').forEach(button => {
        button.parentElement.addEventListener('click', async function() {
            // 检查登录状态
            const loginStatus = checkLoginStatus();
            if (!loginStatus.isLoggedIn) {
                window.location.href = 'login.html';
                return;
            }
            
            const postId = new URLSearchParams(window.location.search).get('id');
            if (postId) {
                // 如果在帖子详情页，滚动到评论区
                const commentSection = document.getElementById('comment-section');
                if (commentSection) {
                    commentSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // 如果不在帖子详情页，跳转到对应的帖子详情
                const postLink = this.closest('article').querySelector('h3 a');
                if (postLink) {
                    window.location.href = postLink.href + '#comment-section';
                }
            }
        });
    });
}

// 分享功能
async function setupShareFunctionality() {
    document.querySelectorAll('.fa-share-alt').forEach(button => {
        button.parentElement.addEventListener('click', async function() {
            const currentUrl = window.location.href;
            navigator.clipboard.writeText(currentUrl)
                .then(async () => {
                    // 尝试使用通知组件
                    try {
                        await loadNotificationScript();
                        if (window.notification) {
                            window.notification.success('链接已复制到剪贴板！');
                        } else {
                            alert('链接已复制到剪贴板！');
                        }
                    } catch (e) {
                        alert('链接已复制到剪贴板！');
                    }
                })
                .catch(async err => {
                    // 尝试使用通知组件
                    try {
                        await loadNotificationScript();
                        if (window.notification) {
                            window.notification.error('复制失败，请手动复制链接');
                        } else {
                            alert('复制失败，请手动复制链接');
                        }
                    } catch (e) {
                        alert('复制失败，请手动复制链接');
                    }
                });
        });
    });
}

// 关注/取消关注功能
async function setupFollowFunctionality() {
    document.querySelectorAll('.follow-button, .unfollow-button').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // 检查登录状态
            const loginStatus = checkLoginStatus();
            if (!loginStatus.isLoggedIn) {
                window.location.href = 'login.html';
                return;
            }
            
            if (this.classList.contains('follow-button')) {
                // 关注
                this.classList.remove('follow-button');
                this.classList.add('unfollow-button', 'bg-gray-200', 'text-gray-700');
                this.classList.remove('bg-primary', 'text-white');
                this.innerHTML = '<i class="fa fa-check mr-1"></i>已关注';
                
                // 尝试使用通知组件
                try {
                    await loadNotificationScript();
                    if (window.notification) {
                        window.notification.success('关注成功！');
                    } else {
                        alert('关注成功！');
                    }
                } catch (e) {
                    alert('关注成功！');
                }
            } else if (this.classList.contains('unfollow-button')) {
                // 取消关注
                if (confirm('确定要取消关注吗？')) {
                    this.classList.remove('unfollow-button', 'bg-gray-200', 'text-gray-700');
                    this.classList.add('follow-button', 'bg-primary', 'text-white');
                    this.innerHTML = '<i class="fa fa-plus mr-1"></i>关注';
                    
                    // 尝试使用通知组件
                    try {
                        await loadNotificationScript();
                        if (window.notification) {
                            window.notification.info('已取消关注');
                        } else {
                            alert('已取消关注');
                        }
                    } catch (e) {
                        alert('已取消关注');
                    }
                }
            }
        });
    });
}

// 页面加载完成后执行的初始化函数
async function init() {
    // 首先加载通知组件
    await loadNotificationScript();
    
    // 检查登录状态
    checkLoginStatus();
    
    // 设置导航栏滚动效果
    setupNavbarScrollEffect();
    
    // 设置搜索功能
    setupSearchFunctionality();
    
    // 设置点赞功能
    await setupLikeFunctionality();
    
    // 设置评论功能
    await setupCommentFunctionality();
    
    // 设置分享功能
    await setupShareFunctionality();
    
    // 设置关注功能
    await setupFollowFunctionality();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        init().catch(err => console.error('初始化失败:', err));
    });
} else {
    init().catch(err => console.error('初始化失败:', err));
}