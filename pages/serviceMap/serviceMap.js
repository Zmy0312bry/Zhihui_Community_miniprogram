// pages/serviceMap/serviceMap.js
const app = getApp();
Page({
  data: {
    // 地图缩放相关
    scale: 1.0,
    minScale: 0.5,
    maxScale: 10.0,  // 提高到600%的最大缩放比例
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
    
    // 初始化触摸相关变量
    this.touchStartDistance = 0;
    this.startScale = 1;
    this.isZooming = false;

    // 设置地图图片URL
    const mapImageUrl = app.getMediaUrl('map.webp');
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
    // 不再显示提示框，用户可以直接操作地图
    // 如需添加后续功能，可以在这里实现
  },

  // 放大地图
  /* 放大缩小功能通过双指实现，此函数保留但不使用 */
  zoomIn: function() {
    const newScale = Math.min(this.data.scale + this.data.scaleStep, this.data.maxScale);
    this.setScale(newScale);
  },
  
  /* 缩小功能通过双指实现，此函数保留但不使用 */
  zoomOut: function() {
    const newScale = Math.max(this.data.scale - this.data.scaleStep, this.data.minScale);
    this.setScale(newScale);
  },

  // 重置缩放
  resetZoom: function() {
    this.setScale(1.0);
    
    wx.showToast({
      title: '已重置缩放',
      icon: 'none',
      duration: 1000
    });
  },
  
  // 处理双指缩放开始
  handleTouchStart: function(e) {
    try {
      if (e.touches.length === 2) {
        // 记录初始两指距离
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        if (!touch1 || !touch2) return;
        
        this.touchStartDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        this.startScale = this.data.scale;
        this.isZooming = true;
        
        console.log('双指缩放开始');
      }
    } catch (err) {
      console.error('触摸开始处理错误:', err);
    }
  },

  // 处理双指缩放过程
  handleTouchMove: function(e) {
    try {
      if (e.touches.length === 2 && this.isZooming) {
        // 计算当前两指距离
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        if (!touch1 || !touch2) return;
        
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        // 计算缩放比例
        let newScale = this.startScale * (currentDistance / this.touchStartDistance);
        
        // 限制缩放范围
        newScale = Math.min(Math.max(newScale, this.data.minScale), this.data.maxScale);
        
        this.setData({
          scale: newScale
        });
      }
    } catch (err) {
      console.error('触摸移动处理错误:', err);
    }
  },
  
  // 处理缩放结束
  handleTouchEnd: function() {
    try {
      if (this.isZooming) {
        console.log('双指缩放结束');
        this.isZooming = false;
      }
    } catch (err) {
      console.error('触摸结束处理错误:', err);
      this.isZooming = false;
    }
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
      imageUrl: app.getMediaUrl('map.webp')
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '上地街道服务地图',
      imageUrl: app.getMediaUrl('map.webp')
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
