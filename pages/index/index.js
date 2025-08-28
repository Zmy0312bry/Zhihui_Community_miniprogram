// index.js

const app = getApp();
Page({
  data: {
    // 添加时间戳确保图片正确加载
    timestamp: Date.now(),
    // 轮播图数据（目前使用相同图片，后续可替换为不同的轮播图）
    bannerList: [
      app.getMediaUrl("lunbo.jpg"),
      // gzh.jpg不添加时间戳参数，避免502错误
      app.getMediaUrl("lunbo1.jpg"),
      app.getMediaUrl("lunbo2.jpg"),
      // gzh.jpg不添加时间戳参数，避免502错误
      app.getMediaUrl("lunbo3.jpg"),
      app.getMediaUrl("lunbo4.jpg"),
    ],
  },

  // 跳转到AI聊天
  goAiChat: function () {
    wx.switchTab({
      url: "/pages/aiChat/aiChat",
    });
  },

  // 跳转到政策法规
  goPolicies: function () {
    wx.navigateTo({
      url: "/pages/policies/policies",
    });
  },

  // 跳转到联系社区
  goContactCommunity: function () {
    wx.navigateTo({
      url: "/pages/contactCommunity/contactCommunity",
    });
  },

  // 跳转到服务地图
  goServiceMap: function () {
    wx.navigateTo({
      url: "/pages/serviceMap/serviceMap",
    });
  },

  // 跳转到养老用餐
  goElderlyMeals: function () {
    wx.navigateTo({
      url: "/pages/elderlyMeals/elderlyMeals",
    });
  },

  // 跳转到健康指导
  goHealthGuidance: function () {
    wx.navigateTo({
      url: "/pages/healthGuidance/healthGuidance",
    });
  },

  // 跳转到卫生服务中心
  goHealthCenter: function () {
    wx.navigateTo({
      url: "/pages/healthCenter/healthCenter",
    });
  },

  // 跳转到意见反馈
  goFeedback: function () {
    wx.navigateTo({
      url: "/pages/feedback/feedback",
    });
  },

  // 显示更多弹窗
  showMore: function () {
    wx.showToast({
      title: '敬请期待',
      icon: 'none',
      duration: 2000
    });
  },

  onLoad: function () {
    // 刷新图片缓存
    this.refreshImages();
  },

  onShow() {
    this.getTabBar().init();
  },

  // 刷新图片，确保能正确加载最新的图片
  refreshImages: function () {
    const timestamp = Date.now();
    this.setData({
      timestamp: timestamp,
      bannerList: [
        app.getMediaUrl("lunbo.jpg"),
        // gzh.jpg不添加时间戳参数，避免502错误
        app.getMediaUrl("lunbo1.jpg"),
        app.getMediaUrl("lunbo2.jpg"),
        // gzh.jpg不添加时间戳参数，避免502错误
        app.getMediaUrl("lunbo3.jpg"),
        app.getMediaUrl("lunbo4.jpg"),
        app.getMediaUrl("lunbo5.jpg"),
      ],
    });
  },
});
