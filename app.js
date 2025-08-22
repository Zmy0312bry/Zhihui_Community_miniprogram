// app.js
const {
    config
} = require('./utils/config');

App({
    onLaunch() {
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
        
        //根据运行环境设置全局常量
        this['globalData']['config'] = config;
        
        //初始化主题为黄色
        this.initTheme();
        
        // 获取系统信息
        this.getSystemInfo();
        
        // 尝试从本地存储获取token
        const userLogin = wx.getStorageSync('userLogin');
        if (userLogin && userLogin.loginToken) {
            this.globalData.token = userLogin.loginToken;
            // 注意：这里只是初始化token，实际登录状态还需要通过接口验证
            // 登录状态会在页面onLoad中验证
        }
    },
    
    globalData: {
        userInfo: null,
        token: null, // 存储JWT token，便于全局访问
        isLoggedIn: false, // 用户登录状态
        config: {},
        baseApiUrl: 'http://127.0.0.1:8080/', // API基础URL，所有API请求都在此基础上拼接
        mediaBaseUrl: 'http://127.0.0.1:8080/media/picture/', // 媒体文件URL前缀
        theme: 'yellow',
        backgroundColor: '#FFF8E1', // 柔和的浅黄色背景
        gradientColors: {
            primary: 'linear-gradient(to bottom, #FFF59D, #FFCC02)', // 简单的柔和黄色渐变
            secondary: 'linear-gradient(to bottom, #FFFDE7, #FFF59D)', // 浅黄色渐变
            accent: 'linear-gradient(to bottom, #FFE082, #FFC107)', // 强调色渐变
        },
        colors: {
            lightYellow: '#FFFDE7',   // 极浅黄色
            softYellow: '#FFF9C4',    // 柔和黄色  
            warmYellow: '#FFF59D',    // 温暖黄色
            primaryYellow: '#FFEB3B', // 主黄色
            deepYellow: '#FFC107',    // 深黄色
            accentYellow: '#FFCC02'   // 强调黄色
        },
        systemInfo: null,
        statusBarHeight: 0,
        navBarHeight: 0,
        isIphoneX: false
    },
    
    /**
     * 获取系统信息
     */
    getSystemInfo() {
        wx.getSystemInfo({
            success: (res) => {
                this.globalData.systemInfo = res
                this.globalData.statusBarHeight = res.statusBarHeight
                this.globalData.navBarHeight = res.statusBarHeight + 44
                
                // 判断是否为 iPhone X 系列
                const model = res.model
                if (model.includes('iPhone X') || model.includes('iPhone 11') || 
                    model.includes('iPhone 12') || model.includes('iPhone 13') || 
                    model.includes('iPhone 14') || model.includes('iPhone 15')) {
                    this.globalData.isIphoneX = true
                }
                
                console.log('系统信息获取成功:', res)
            },
            fail: (error) => {
                console.error('获取系统信息失败:', error)
            }
        })
    },
    
    initTheme: function () {
        // 使用柔和的渐变黄色主题
        this.globalData.theme = 'yellow';
        this.globalData.backgroundColor = this.globalData.colors.lightYellow;
        
        // 设置导航栏为柔和的渐变黄色
        wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: this.globalData.colors.warmYellow, // 使用温暖黄色作为导航栏背景
            animation: {
                duration: 400,
                timingFunc: 'easeIn'
            }
        });
    },

    onThemeChange: function (selectedTheme) {
        // 保持兼容性，使用柔和的渐变黄色主题
        wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: this.globalData.colors.warmYellow,
            animation: {
                duration: 400,
                timingFunc: 'easeIn'
            }
        });
    },

    /**
     * 获取渐变色样式
     * @param {string} type - 渐变类型：'primary'、'secondary'、'accent'
     * @returns {string} 渐变色CSS样式
     */
    getGradientStyle: function(type = 'primary') {
        return this.globalData.gradientColors[type] || this.globalData.gradientColors.primary;
    },

    /**
     * 获取主题颜色
     * @param {string} colorName - 颜色名称
     * @returns {string} 颜色值
     */
    getThemeColor: function(colorName = 'primaryYellow') {
        return this.globalData.colors[colorName] || this.globalData.colors.primaryYellow;
    },
    
    /**
     * 拼接API路径
     * @param {string} path - API路径，例如：'api/login'
     * @returns {string} 完整的API URL
     */
    getApiUrl: function(path) {
        // 确保path不以/开头
        if (path && path.startsWith('/')) {
            path = path.substring(1);
        }
        return this.globalData.baseApiUrl + path;
    },
    
    /**
     * 拼接媒体文件路径
     * @param {string} filename - 媒体文件名，例如：'avatar.jpg'
     * @returns {string} 完整的媒体文件URL
     */
    getMediaUrl: function(filename) {
        // 确保filename不以/开头
        if (filename && filename.startsWith('/')) {
            filename = filename.substring(1);
        }
        return this.globalData.mediaBaseUrl + filename;
    }})
