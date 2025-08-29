// pages/serviceMap/serviceMap.js
const app = getApp();
Page({
  data: {
    // 地图缩放相关
    scale: 1.0,
    minScale: 0.5,
    maxScale: 3.0,
    scaleStep: 0.25,

    // 地图状态
    mapLoaded: false,
    mapError: false,
    loading: true,

    // 地图信息
    mapTitle: '上地街道服务分布图',
    mapDescription: '展示上地街道各类服务设施分布情况',

    // 地图图片URL
    mapImageUrl: ''
  },

  onLoad: function (options) {
    console.log('服务地图页面加载');

    // 设置地图图片URL
    const mapImageUrl = app.getMediaUrl('map.jpg');
    console.log('地图图片URL:', mapImageUrl);

    this.setData({
      mapImageUrl: mapImageUrl,
      loading: false  // 直接设置为false，让图片自然加载
    });
  },

  onShow: function () {
    console.log('服务地图页面显示');
  },

  // 加载地图图片
  loadMapImage: function() {
    const that = this;
    this.setData({
      loading: true,
      mapError: false
    });

    // 模拟图片加载过程
    setTimeout(() => {
      that.setData({
        loading: false,
        mapLoaded: true
      });
      console.log('地图图片加载完成');
    }, 1000);
  },

  // 地图图片加载成功
  onMapLoad: function(e) {
    console.log('地图图片加载成功', e);
    this.setData({
      mapLoaded: true,
      loading: false,
      mapError: false
    });

    wx.showToast({
      title: '地图加载完成',
      icon: 'success',
      duration: 1500
    });
  },

  // 地图图片加载失败
  onMapError: function(e) {
    console.error('地图图片加载失败', e);
    this.setData({
      mapError: true,
      loading: false,
      mapLoaded: false
    });

    wx.showToast({
      title: '地图加载失败',
      icon: 'error',
      duration: 2000
    });
  },

  // 点击地图
  onMapTap: function(e) {
    console.log('点击地图位置', e);

    // 这里可以添加点击地图不同区域的交互逻辑
    wx.showModal({
      title: '地图交互',
      content: '点击了地图上的位置，可以在这里添加具体的服务点信息或导航功能',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 放大地图
  zoomIn: function() {
    const newScale = Math.min(this.data.scale + this.data.scaleStep, this.data.maxScale);
    this.setScale(newScale);
  },

  // 缩小地图
  zoomOut: function() {
    const newScale = Math.max(this.data.scale - this.data.scaleStep, this.data.minScale);
    this.setScale(newScale);
  },

  // 重置缩放
  resetZoom: function() {
    this.setScale(1.0);
  },

  // 设置缩放比例
  setScale: function(scale) {
    this.setData({
      scale: scale
    });

    // 显示缩放提示
    wx.showToast({
      title: `缩放: ${Math.round(scale * 100)}%`,
      icon: 'none',
      duration: 1000
    });

    console.log('地图缩放比例:', scale);
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '上地街道服务地图',
      path: '/pages/serviceMap/serviceMap',
      imageUrl: app.getMediaUrl('map.jpg')
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '上地街道服务地图',
      imageUrl: app.getMediaUrl('map.jpg')
    };
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    console.log('下拉刷新');
    this.loadMapImage();

    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 页面滚动
  onPageScroll: function(e) {
    // 可以在这里添加滚动相关的逻辑
  },

  // 页面隐藏
  onHide: function() {
    console.log('服务地图页面隐藏');
  },

  // 页面卸载
  onUnload: function() {
    console.log('服务地图页面卸载');
  }
});
