// pages/webview/webview.js
Page({
  data: {
    url: '',
    loading: true
  },

  onLoad: function (options) {
    if (options.url) {
      // 解码 URL
      const url = decodeURIComponent(options.url);
      console.log('加载网页:', url);
      this.setData({ url });
    } else {
      wx.showToast({
        title: '网页地址无效',
        icon: 'error'
      });
      // 1秒后返回
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    }
  },

  onShow: function () {
    // 页面显示时的处理
  },

  // 网页加载完成
  handleLoad: function (e) {
    console.log('网页加载完成');
    this.setData({ loading: false });
  },

  // 网页加载失败
  handleError: function (e) {
    console.error('网页加载失败:', e.detail.errorMsg);
    this.setData({ loading: false });
    wx.showToast({
      title: '网页加载失败',
      icon: 'none',
      duration: 2000
    });
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },

  // 防止事件冒泡
  preventClose: function () {
    return false;
  }
});
