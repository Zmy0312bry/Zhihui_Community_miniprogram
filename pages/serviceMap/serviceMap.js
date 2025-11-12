// pages/serviceMap/serviceMap.js
const app = getApp();
Page({
  data: {
    // 第一张地图信息
    map1: {
      title: '上地街道服务分布图',
      desc: '展示服务设施分布',
      thumbnailUrl: ''
    },
    
    // 第二张地图信息
    map2: {
      title: '上地街道服务名录',
      desc: '服务机构详细信息',
      thumbnailUrl: ''
    }
  },

  onLoad: function (options) {
    console.log('服务地图页面加载');
    
    // 获取两张地图的缩略图URL（低清版本，用于列表预览）
    const map1ThumbnailUrl = app.getMediaUrl('mapl.webp');
    const map2ThumbnailUrl = app.getMediaUrl('map2l.jpg');
    
    console.log('地图1缩略图URL:', map1ThumbnailUrl);
    console.log('地图2缩略图URL:', map2ThumbnailUrl);
    
    if (!map1ThumbnailUrl) console.error('❌ 地图1缩略图 URL 为空！');
    if (!map2ThumbnailUrl) console.error('❌ 地图2缩略图 URL 为空！');

    // 设置缩略图作为卡片预览
    this.setData({
      'map1.thumbnailUrl': map1ThumbnailUrl || '',
      'map2.thumbnailUrl': map2ThumbnailUrl || ''
    });
    
    // 预热缩略图缓存
    this.preloadImages([map1ThumbnailUrl, map2ThumbnailUrl]);
  },

  /**
   * 预热图片缓存：异步下载图片，这样详情页可以直接使用缓存
   */
  preloadImages: function(urls) {
    urls.forEach(url => {
      if (url) {
        wx.getImageInfo({
          src: url,
          success: () => {
            console.log('✅ 图片已预热缓存:', url);
          },
          fail: () => {
            console.warn('⚠️ 图片预热失败:', url);
          }
        });
      }
    });
  },

  onShow: function () {
    console.log('服务地图页面显示');
  },

  /**
   * 导航到地图详情页面
   * @param {Event} e 事件对象，包含 data-mapid
   */
  navigateToMapDetail: function(e) {
    const mapId = e.currentTarget.dataset.mapid;
    console.log('导航到地图详情页面，mapId:', mapId);
    
    wx.navigateTo({
      url: `/pages/mapDetail/mapDetail?mapId=${mapId}`,
      fail: function(err) {
        console.error('导航失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'error',
          duration: 1500
        });
      }
    });
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack({
      delta: 1
    });
  }
});
