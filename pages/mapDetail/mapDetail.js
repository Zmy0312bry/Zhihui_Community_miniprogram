// pages/mapDetail/mapDetail.js
const app = getApp();
Page({
  data: {
    mapId: 0,
    mapInfo: {
      title: '',
      desc: '',
      imageUrl: ''
    },
    // 缩放相关
    scale: 1.0,
    scalePercent: 100,
    translateX: 0,
    translateY: 0,
    displayWidth: 0,
    displayHeight: 0,
    baseWidth: 0,
    baseHeight: 0,
    containerWidth: 0,
    containerHeight: 0,
    // 配置
    minScale: 0.8,
    maxScale: 10.0,
    scaleStep: 0.1,
    loading: true,
    mapLoaded: false
  },

  // 触摸相关变量
  touchStartDistance: 0,
  startScale: 1,
  isZooming: false,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,

  onLoad: function (options) {
    console.log('地图详情页面加载，options:', options);
    
    const mapId = parseInt(options.mapId) || 1;
    this.setData({ mapId });
    
    // 根据 mapId 获取对应的地图信息
    this.loadMapData(mapId);
  },

  onShow: function () {
    console.log('地图详情页面显示');
  },

  /**
   * 加载地图数据 - 加载高清图版本
   */
  loadMapData: function(mapId) {
    console.log('加载地图数据，mapId:', mapId);
    
    let mapInfo = {};
    let imageUrl = '';
    
    if (mapId === 1) {
      imageUrl = app.getMediaUrl('map.webp');
      mapInfo = {
        title: '上地街道服务分布图',
        desc: '展示上地街道各类服务设施分布情况',
        imageUrl: imageUrl
      };
    } else if (mapId === 2) {
      imageUrl = app.getMediaUrl('map2.jpg');
      mapInfo = {
        title: '上地街道服务名录',
        desc: '服务机构详细信息',
        imageUrl: imageUrl
      };
    }
    
    console.log('地图信息:', mapInfo);
    
    if (!imageUrl) {
      console.error('❌ 地图 URL 为空！');
      this.setData({ loading: false });
      wx.showToast({
        title: '地图加载失败',
        icon: 'error',
        duration: 2000
      });
      return;
    }

    // 加载高清版本的地图图片
    this.setData({
      mapInfo: {
        ...mapInfo,
        imageUrl: imageUrl
      }
      // 注意：不立即关闭 loading，等 onImageLoad 触发后再关闭
    }, () => {
      console.log('✅ 地图URL已设置，准备加载高清图片');
    });
  },

  /**
   * 图片加载成功
   */
  onImageLoad: function(e) {
    console.log('地图图片加载成功', e.detail);
    const { width, height } = e.detail;
    
    wx.getSystemInfo({
      success: (res) => {
        const screenWidth = res.windowWidth;
        const containerWidth = screenWidth - 60; // 减去左右 padding 各 30rpx
        const displayHeight = Math.round(containerWidth * (height / width));
        
        // 立即隐藏加载层，显示图片
        this.setData({
          mapLoaded: true,
          loading: false,
          containerWidth: containerWidth,
          displayWidth: containerWidth,
          displayHeight: displayHeight,
          baseWidth: containerWidth,
          baseHeight: displayHeight,
          containerHeight: displayHeight
        }, () => {
          console.log('✅ 地图图片加载完成，尺寸:', {
            原始宽: width,
            原始高: height,
            显示宽: containerWidth,
            显示高: displayHeight
          });
          wx.showToast({
            title: '图片加载完成',
            icon: 'success',
            duration: 800
          });
        });
      }
    });
  },

  /**
   * 图片加载失败
   */
  onImageError: function(e) {
    console.error('地图图片加载失败', e);
    this.setData({ loading: false });
    wx.showToast({
      title: '地图加载失败',
      icon: 'error',
      duration: 2000
    });
  },

  /**
   * 处理触摸开始
   */
  handleTouchStart: function(e) {
    try {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        if (!touch1 || !touch2) return;
        
        this.touchStartDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        this.startScale = this.data.scale;
        this.isZooming = true;
        
        console.log('双指缩放开始，初始距离:', this.touchStartDistance);
      } else if (e.touches.length === 1) {
        this.dragStartX = e.touches[0].clientX;
        this.dragStartY = e.touches[0].clientY;
        this.isDragging = true;
      }
    } catch (err) {
      console.error('触摸开始处理错误:', err);
    }
  },

  /**
   * 处理触摸移动
   */
  handleTouchMove: function(e) {
    try {
      if (e.touches.length === 2 && this.isZooming) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        if (!touch1 || !touch2) return;
        
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        const scaleFactor = currentDistance / this.touchStartDistance;
        let newScale = this.startScale * scaleFactor;
        
        newScale = Math.max(this.data.minScale, Math.min(newScale, this.data.maxScale));
        
        const scalePercent = Math.round(newScale * 100);
        const baseWidth = this.data.baseWidth;
        const baseHeight = this.data.baseHeight;
        const newDisplayWidth = Math.round(baseWidth * newScale);
        const newDisplayHeight = Math.round(baseHeight * newScale);
        
        this.setData({
          scale: newScale,
          scalePercent: scalePercent,
          displayWidth: newDisplayWidth,
          displayHeight: newDisplayHeight
        });
        
        console.log('缩放中:', scalePercent, '%, 显示尺寸:', newDisplayWidth, 'x', newDisplayHeight);
      } else if (e.touches.length === 1 && this.isDragging && this.data.scale > 1) {
        const moveX = e.touches[0].clientX - this.dragStartX;
        const moveY = e.touches[0].clientY - this.dragStartY;
        
        let newTranslateX = this.data.translateX + moveX;
        let newTranslateY = this.data.translateY + moveY;
        
        const maxTranslateX = Math.max(0, (this.data.displayWidth - this.data.containerWidth) / 2);
        const maxTranslateY = Math.max(0, (this.data.displayHeight - this.data.containerHeight) / 2);
        
        newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
        newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
        
        this.setData({
          translateX: newTranslateX,
          translateY: newTranslateY
        });
        
        this.dragStartX = e.touches[0].clientX;
        this.dragStartY = e.touches[0].clientY;
      }
    } catch (err) {
      console.error('触摸移动处理错误:', err);
    }
  },

  /**
   * 处理触摸结束
   */
  handleTouchEnd: function(e) {
    try {
      if (this.isZooming) {
        console.log('双指缩放结束，最终缩放:', this.data.scalePercent, '%');
        this.isZooming = false;
      }
      if (this.isDragging) {
        this.isDragging = false;
      }
    } catch (err) {
      console.error('触摸结束处理错误:', err);
      this.isZooming = false;
      this.isDragging = false;
    }
  },

  /**
   * 重置缩放
   */
  resetZoom: function() {
    let baseWidth = this.data.baseWidth;
    let baseHeight = this.data.baseHeight;
    
    if (baseWidth === 0 || baseHeight === 0) {
      baseWidth = this.data.containerWidth || (wx.getSystemInfoSync().windowWidth - 60);
      baseHeight = this.data.containerHeight || 400;
    }
    
    console.log('重置缩放 - 使用基础尺寸:', { baseWidth, baseHeight });
    
    this.setData({
      scale: 1.0,
      scalePercent: 100,
      translateX: 0,
      translateY: 0,
      displayWidth: baseWidth,
      displayHeight: baseHeight
    });
    
    wx.showToast({
      title: '已重置',
      icon: 'none',
      duration: 800
    });
  },

  /**
   * 放大
   */
  zoomIn: function() {
    const newScale = Math.min(this.data.scale + this.data.scaleStep, this.data.maxScale);
    this.updateScale(newScale);
  },

  /**
   * 缩小
   */
  zoomOut: function() {
    const newScale = Math.max(this.data.scale - this.data.scaleStep, this.data.minScale);
    this.updateScale(newScale);
  },

  /**
   * 更新缩放
   */
  updateScale: function(newScale) {
    const scalePercent = Math.round(newScale * 100);
    const baseWidth = this.data.baseWidth;
    const baseHeight = this.data.baseHeight;
    const newDisplayWidth = Math.round(baseWidth * newScale);
    const newDisplayHeight = Math.round(baseHeight * newScale);
    
    this.setData({
      scale: newScale,
      scalePercent: scalePercent,
      displayWidth: newDisplayWidth,
      displayHeight: newDisplayHeight
    });
  },

  /**
   * 返回
   */
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  onHide: function () {
    console.log('地图详情页面隐藏');
  },

  onUnload: function () {
    console.log('地图详情页面卸载');
  }
});
