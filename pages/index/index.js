// index.js

const app = getApp();
Page({
  data: {
      // 轮播图数据（目前使用相同图片，后续可替换为不同的轮播图）
      bannerList: [
          '/static/img/lunbo.jpg',
          '/static/img/gzh.jpg',
          '/static/img/lunbo.jpg',
          '/static/img/gzh.jpg',
          '/static/img/lunbo.jpg'
      ],
      // 健康指导弹窗显示状态
      showHealthPopup: false,
      // 健康指导内容
      healthTips: {
          warmTips: '今日天气晴朗，适合户外活动。请注意防晒，多喝水，保持良好的心情。建议老年朋友们可以到社区花园散步，与邻里朋友聊天交流。',
          healthAdvice: '1. 早晨起床后喝一杯温开水，有助于肠胃蠕动\n2. 适量运动，建议每天步行30分钟\n3. 饮食均衡，多吃蔬菜水果\n4. 保持充足睡眠，晚上10点前入睡\n5. 定期测量血压血糖，关注身体变化'
      }
  },

    // 跳转到AI聊天
    goAiChat: function() {
        wx.switchTab({
            url: "/pages/aiChat/aiChat"
        });
    },

    // 跳转到联系社区
    goContactCommunity: function() {
        wx.navigateTo({
            url: "/pages/contactCommunity/contactCommunity"
        });
    },

    // 跳转到养老用餐
    goElderlyMeals: function() {
        wx.navigateTo({
            url: "/pages/elderlyMeals/elderlyMeals"
        });
    },

    // 显示健康指导弹窗
    showHealthTips: function() {
        this.setData({
            showHealthPopup: true
        });
    },

    // 隐藏健康指导弹窗
    hideHealthTips: function() {
        this.setData({
            showHealthPopup: false
        });
    },

    onShow(){
        this.getTabBar().init();
    },
})
