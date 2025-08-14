// index.js

const app = getApp();
Page({
  data: {
      avatarUrl: '/static/icon/ai.png',
      greeting: '智汇社区专属AI助手',
      scrollText: '欢迎使用智汇社区AI聊天小程序！',
  },

    goChat: function() {
        wx.switchTab({
            url: "/pages/aiChat/aiChat"
        });
    },

    handleButton2Tap: function() {
        // 按钮2点击事件处理
    },

    onShow(){
        this.getTabBar().init();
        const cachedTheme = wx.getStorageSync('currentTheme');
        if (cachedTheme) {
           app.onThemeChange(cachedTheme);
        }
    },
})
