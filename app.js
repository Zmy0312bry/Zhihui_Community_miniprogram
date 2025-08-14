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
        //初始化主题
        this.loadThemeFromCache();
    },
    globalData: {
        userInfo: null,
        config: {},
        theme: 'yellow',
        backgroundColor: '#FFD000',
        themeList: [
            {
                name: 'yellow',
                text: '黄色',
                textColor: '#8c6031',
                backgroundColor: '#FFD000'
            },
            {
                name: 'cyan',
                text: '青色',
                textColor: '#ffffff',
                backgroundColor: '#14B0BB'
            },
            {
                name: 'pink',
                text: '粉色',
                textColor: '#f3b9b2',
                backgroundColor: '#F05B7A'
            },
            {
                name: 'purple',
                text: '紫色',
                textColor: '#ffffff',
                backgroundColor: '#cb7ddf'
            },
            {
                name: 'green-grass',
                text: '草绿',
                textColor: '#5d6021',
                backgroundColor: '#e3eabb'
            },
            {
                name: 'cyan-verdant',
                text: '青葱',
                textColor: '#417036',
                backgroundColor: '#d1e9cd'
            },
            {
                name: 'blue-aqua',
                text: '水蓝',
                textColor: '#2e6167',
                backgroundColor: '#bbe4e3'
            },
        ]
    },
    loadThemeFromCache: function () {
        // 尝试从本地存储加载主题
        const cachedTheme = wx.getStorageSync('currentTheme');
        if (cachedTheme) {
            this.updateTheme(cachedTheme);
        } else {
            // 如果没有缓存则使用默认主题
            this.updateTheme();
        }
    },
    updateTheme: function (theme) {
        theme = theme || this.globalData.theme;

        // 从themeList中查找对应主题的backgroundColor
        const selectedTheme = this.globalData.themeList.find(item => item.name === theme);

        if (!selectedTheme) {
            console.error('找不到对应的主题:', theme);
            return;
        }
        this.globalData.theme = theme;

        this.globalData.backgroundColor = selectedTheme.backgroundColor;
        // // 更新全局样式
        // wx.setNavigationBarColor({
        //     frontColor: '#000000',
        //     backgroundColor: this.globalData.backgroundColor,
        //     animation: {
        //         duration: 400,
        //         timingFunc: 'easeIn'
        //     }
        // });
        //
        // wx.setTabBarStyle({
        //     color: '#7A7E83',
        //     backgroundColor: this.globalData.backgroundColor
        // });

        // 更新所有页面的样式
        const pages = getCurrentPages();
        pages.forEach(page => {
            page.setData({
                backgroundColor: this.globalData.backgroundColor
            });
        });
        this.onThemeChange(selectedTheme);

        // 缓存主题
        wx.setStorageSync('currentTheme', selectedTheme);
    },
    onThemeChange: function (selectedTheme) {
        wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: selectedTheme.backgroundColor,
            animation: {
                duration: 400,
                timingFunc: 'easeIn'
            }
        });
    }
})
