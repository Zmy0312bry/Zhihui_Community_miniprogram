import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';


var api = require('./../../utils/api')
var app = getApp()
Page({
    data: {
        scrollTop: 0,
        avatarUrl: app.getMediaUrl('default.png'),
        nickname: '',
        isLogin: false,
        phone: '',
        userInfo: {},
        isAuth: true,
        isIphone: false,
        show: false,
        timestamp: Date.now(),
        // 参照首页轮播图的做法，在data中定义二维码图片路径
        qrcodeImage: app.getMediaUrl('gzh.jpg')
    },

    onClickShow() {
        // 重新设置时间戳确保图片刷新，参照首页轮播图的加载方式
        this.setData({ 
            show: true,
            timestamp: Date.now(),
            qrcodeImage: app.getMediaUrl('gzh.jpg') // 确保图片路径正确
        });
    },

    onClickHide() {
        this.setData({ show: false });
    },

    onClose() {
        this.setData({ show: false });
    },

    // 检查登录状态并执行操作
    checkLoginAndExecute(operation, requireLogin = true) {
        if (requireLogin && !this.data.isLogin) {
            Dialog.confirm({
                title: '提示',
                message: '需要登录才能访问此功能，是否现在登录？',
                confirmButtonText: '立即登录',
                cancelButtonText: '取消',
                confirmButtonColor: '#FFC107'
            }).then(() => {
                this.setLogin();
            }).catch(() => {
                // 用户取消登录
            });
            return false;
        }
        
        // 已登录或不需要登录
        if (typeof operation === 'function') {
            operation();
        }
        return true;
    },
    
    // 跳转到个人信息页面
    goToPersonalInfo() {
        this.checkLoginAndExecute(() => {
            wx.navigateTo({
                url: '/pages/personalInfo/personalInfo'
            });
        });
    },

    // 跳转到关于我们页面
    goToAboutUs() {
        wx.navigateTo({
            url: '/pages/aboutUs/aboutUs'
        });
    },

    // 图片加载成功
    onImageLoad(e) {
        console.log('二维码图片加载成功:', e);
        console.log('图片尺寸:', e.detail);
    },

    // 图片加载失败
    onImageError(e) {
        console.error('二维码图片加载失败:', e);
        console.error('错误详情:', e.detail);
        
        wx.showToast({
            title: '图片加载失败，正在重试...',
            icon: 'none'
        });
    },

    // 用户点击登录按钮时调用
    login() {
        this.setLogin();
    },
    // 登录处理方法
    setLogin() {
        const that = this;
        
        // 显示加载动画，提升用户体验
        Toast.loading({
            message: '登录中...',
            forbidClick: true,
            loadingType: 'spinner',
            duration: 0
        });
        
        that.goLogin((res) => {
            Toast.clear();
            Toast.success('登录成功');
        }).catch(err => {
            Toast.clear();
            Toast.fail('登录失败');
        });
    },
    // 已删除cancelLogin方法，根据需求不再需要退出登录功能
    goLogin(callback = () => {}) {
        const that = this;
        
        return new Promise((resolve, reject) => {
            wx.login({
                success: res => {
                    console.log('login', res);
                    //发送 res.code 到后台换取 token 和用户信息
                    const config = {
                        url: api.wxlogin_url,
                        method: 'POST',
                        data: {
                            code: res.code
                        }
                    };
                    
                    wx.showLoading({
                        title: '登录中...',
                        mask: true
                    });
                    
                    api.getRequestOpen(config)
                        .then(res => {
                            console.log("loginRes", res);
                            if (res.code === 200 && res.data && res.data.token) {
                                // 保存token到内存和本地存储
                                that.saveUserLoginData(res.data);
                                
                                // 登录成功后获取用户资料
                                that.getUserProfile();
                                that.setData({
                                    isAuth: true,
                                    isLogin: true
                                });
                                
                                if (callback) {
                                    callback(res);
                                }
                                
                                resolve(res);
                            } else {
                                that.setData({
                                    isAuth: false
                                });
                                
                                const errorMsg = res.message || '登录失败';
                                reject(new Error(errorMsg));
                            }
                        })
                        .catch(err => {
                            console.error('登录失败:', err);
                            reject(err);
                        })
                        .finally(() => {
                            wx.hideLoading();
                        });
                },
                fail: (error) => {
                    console.error('获取登录凭证失败:', error);
                    reject(new Error('获取登录凭证失败'));
                }
            });
        });
    },
    
    // 保存用户登录数据
    saveUserLoginData(data) {
        app.globalData.token = data.token;
        app.globalData.isLoggedIn = true;
        
        const userData = {
            loginToken: data.token,
            user_info: data.user_info
        };
        
        wx.setStorage({
            key: 'userLogin',
            data: userData
        });
    },
    // 设置未登录状态
    setNotLoggedInState() {
        app.globalData.isLoggedIn = false;
        this.setData({
            isLogin: false,
            isAuth: true,
            avatarUrl: app.getMediaUrl('default.png'),
            nickname: ''
        });
    },
    
    // 检查登录状态
    checkLoginStatus() {
        const that = this;
        
        // 首先检查内存中是否有token
        if (app.globalData.token) {
            // 如果内存中有token，直接携带token请求校验接口
            const config = {
                url: api.check_login_status_url,
                method: 'GET',
                header: {
                    'Authorization': 'Bearer ' + app.globalData.token
                }
            };
            
            wx.request({
                url: config.url,
                method: config.method,
                header: config.header,
                success: function(res) {
                    console.log("登录状态校验结果:", res.data);
                    if (res.data.code === 200) {
                        // 登录状态有效
                        app.globalData.isLoggedIn = true;
                        that.setData({
                            isLogin: true,
                            isAuth: true
                        });
                        
                        // 获取用户个人资料
                        that.getUserProfile();
                    } else {
                        // 登录状态无效
                        app.globalData.token = null; // 清除无效的token
                        that.setNotLoggedInState();
                        
                        // 可以根据不同的错误码显示不同的提示
                        if (res.data.code === 401) {
                            wx.showToast({
                                title: '登录已过期，请重新登录',
                                icon: 'none'
                            });
                        }
                    }
                },
                fail: function(err) {
                    console.error("登录状态校验失败:", err);
                    that.setNotLoggedInState();
                }
            });
        } else {
            // 内存中没有token，尝试从本地存储获取
            wx.getStorage({
                key: 'userLogin',
                success: function(res) {
                    if (res.data && res.data.loginToken) {
                        // 保存到内存中
                        app.globalData.token = res.data.loginToken;
                        
                        // 使用token校验登录状态
                        that.checkLoginStatus();
                    } else {
                        // 本地存储也没有token
                        that.setNotLoggedInState();
                    }
                },
                fail: function() {
                    // 获取本地存储失败
                    that.setNotLoggedInState();
                }
            });
        }
    },
    
    // 获取用户个人资料
    getUserProfile() {
        const that = this;
        
        // 确保使用内存中的token
        if (!app.globalData.token) {
            console.error("获取用户资料失败: 无可用token");
            return Promise.reject(new Error("无可用token"));
        }
        
        return new Promise((resolve, reject) => {
            wx.request({
                url: api.userInfo_url,
                method: 'GET',
                header: {
                    'Authorization': 'Bearer ' + app.globalData.token
                },
                success: function(res) {
                    console.log("获取用户资料结果:", res.data);
                    if (res.data && res.data.code === 200 && res.data.data) {
                        const userData = res.data.data;
                        that.setData({
                            userInfo: userData,
                            avatarUrl: userData.avatar_url || app.getMediaUrl('default.png'),
                            nickname: userData.nickname || '',
                        });
                        resolve(userData);
                    } else {
                        console.warn("获取用户资料失败:", res.data);
                        reject(new Error(res.data.message || "获取用户资料失败"));
                        
                        // 如果返回401，说明token已过期
                        if (res.data.code === 401) {
                            that.setNotLoggedInState();
                            wx.showToast({
                                title: '登录已过期，请重新登录',
                                icon: 'none'
                            });
                        }
                    }
                },
                fail: function(err) {
                    console.error("获取用户资料请求失败:", err);
                    reject(err);
                }
            });
        });
    },
    
    loginAuthState() {
        this.checkLoginStatus();
    },
    // 用户修改头像时跳转到个人信息页面
    onChooseAvatar(e) {
        // 检查用户是否已登录
        if (!this.data.isLogin) {
            Dialog.confirm({
                title: '提示',
                message: '需要登录才能修改个人头像，是否现在登录？',
                confirmButtonText: '立即登录',
                cancelButtonText: '暂不登录',
                confirmButtonColor: '#FFC107'
            }).then(() => {
                this.setLogin();
            }).catch(() => {
                // 用户取消登录
            });
            return;
        }
        
        // 已登录则跳转到个人信息页
        wx.navigateTo({
            url: '/pages/personalInfo/personalInfo'
        });
    },
    
    // 用户修改昵称时跳转到个人信息页面
    onChooseNickname(e) {
        // 检查用户是否已登录
        if (!this.data.isLogin) {
            Toast({
                type: 'fail',
                message: '请先登录',
                onClose: () => {
                    this.setLogin();
                }
            });
            return;
        }
        
        // 已登录则跳转到个人信息页
        wx.navigateTo({
            url: '/pages/personalInfo/personalInfo'
        });
    },

    onLoad() {
        // 页面加载时的初始化操作
        console.log('个人中心页面加载');
        
        // 确保二维码图片路径正确初始化
        this.setData({
            qrcodeImage: app.getMediaUrl('gzh.jpg'),
            timestamp: Date.now()
        });
        
        // 检测是否为 iPhone，调整 UI 样式
        wx.getSystemInfo({
            success: (res) => {
                const isIphone = /iPhone/.test(res.model);
                this.setData({
                    isIphone: isIphone
                });
            }
        });
        
        // 校验登录状态
        this.checkLoginStatus();
    },
    onShow() {
        // 初始化底部标签栏
        if (typeof this.getTabBar === 'function') {
            this.getTabBar().init();
        }
        
        // 每次显示页面时检查登录状态
        this.checkLoginStatus();
    },
})
