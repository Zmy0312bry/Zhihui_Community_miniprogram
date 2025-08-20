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
    },
    
    globalData: {
        userInfo: null,
        config: {},
        theme: 'yellow',
        backgroundColor: '#FFD000',
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
        // 固定使用黄色主题
        this.globalData.theme = 'yellow';
        this.globalData.backgroundColor = '#FFD000';
        
        // 设置导航栏颜色
        wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: this.globalData.backgroundColor,
            animation: {
                duration: 400,
                timingFunc: 'easeIn'
            }
        });
    },
    
    onThemeChange: function (selectedTheme) {
        // 保持兼容性，但固定为黄色主题
        wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: '#FFD000',
            animation: {
                duration: 400,
                timingFunc: 'easeIn'
            }
        });
    }
})
