// pages/healthGuidance/healthGuidance.js
const app = getApp();

Page({
  data: {
    // 心肺复苏指导图片
    cprImages: [
      {
        id: 1,
        title: "成人心肺复苏指导",
        image: app.getMediaUrl('xinfei1.jpg'),
        desc: "适用于18岁以上成人"
      },
      {
        id: 2,
        title: "儿童心肺复苏指导",
        image: app.getMediaUrl('xinfei2.jpg'),
        desc: "适用于1-8岁儿童"
      },
      {
        id: 3,
        title: "婴儿心肺复苏指导",
        image: app.getMediaUrl('xinfei3.jpg'),
        desc: "适用于1岁以下婴儿"
      }
    ],

    // 阿尔茨海默症科普数据
    alzheimerData: {
      title: "阿尔茨海默症的科普与预防",
      totalSlides: 24,
      currentSlide: 1,
      slides: []
    },

    // 图片预览相关
    showImageViewer: false,
    currentImage: '',
    currentImageTitle: '',
    scale: 1,
    zoomPercent: 100,

    // 阿尔茨海默症幻灯片预览
    showAlzheimerViewer: false,
    alzheimerCurrentSlide: 1,
    alzheimerScale: 1,
    alzheimerZoomPercent: 100,

    // 拖拽相关
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    translateX: 0,
    translateY: 0,

    // 两指缩放相关
    initialDistance: 0,
    initialScale: 1
  },

  onLoad: function (options) {
    this.initAlzheimerSlides();
  },

  onShow: function () {
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 初始化阿尔茨海默症幻灯片
  initAlzheimerSlides: function() {
    const slides = [];
    for (let i = 1; i <= 24; i++) {
      slides.push({
        id: i,
        image: app.getMediaUrl(`chidai/幻灯片${i}.png`),
        title: `阿尔茨海默症科普与预防 - 第${i}页`
      });
    }
    this.setData({
      'alzheimerData.slides': slides
    });
  },

  // 查看心肺复苏图片
  viewCPRImage: function (e) {
    const image = e.currentTarget.dataset.image;
    const title = e.currentTarget.dataset.title;

    this.setData({
      showImageViewer: true,
      currentImage: image,
      currentImageTitle: title,
      scale: 1, // 默认铺满全屏
      zoomPercent: 100,
      translateX: 0,
      translateY: 0,
      isDragging: false
    });
  },

  // 查看阿尔茨海默症幻灯片
  viewAlzheimerSlides: function () {
    this.setData({
      showAlzheimerViewer: true,
      alzheimerCurrentSlide: 1,
      alzheimerScale: 1,
      alzheimerZoomPercent: 100,
      translateX: 0,
      translateY: 0,
      isDragging: false
    });
  },

  // 关闭图片预览
  closeImageViewer: function () {
    this.setData({
      showImageViewer: false,
      currentImage: '',
      currentImageTitle: '',
      scale: 1,
      zoomPercent: 100,
      translateX: 0,
      translateY: 0,
      isDragging: false
    });
  },

  // 关闭阿尔茨海默症预览
  closeAlzheimerViewer: function () {
    this.setData({
      showAlzheimerViewer: false,
      alzheimerCurrentSlide: 1,
      alzheimerScale: 1,
      alzheimerZoomPercent: 100,
      translateX: 0,
      translateY: 0,
      isDragging: false
    });
  },

  // 上一页
  prevSlide: function () {
    const current = this.data.alzheimerCurrentSlide;
    if (current > 1) {
      this.setData({
        alzheimerCurrentSlide: current - 1,
        alzheimerScale: 1,
        alzheimerZoomPercent: 100,
        translateX: 0,
        translateY: 0,
        isDragging: false
      });
    }
  },

  // 下一页
  nextSlide: function () {
    const current = this.data.alzheimerCurrentSlide;
    const total = this.data.alzheimerData.totalSlides;
    if (current < total) {
      this.setData({
        alzheimerCurrentSlide: current + 1,
        alzheimerScale: 1,
        alzheimerZoomPercent: 100,
        translateX: 0,
        translateY: 0,
        isDragging: false
      });
    }
  },

  // 缩放控制
  zoomIn: function () {
    const currentScale = this.data.scale;
    if (currentScale < 3) {
      const newScale = Math.min(currentScale + 0.2, 3);
      this.setData({
        scale: newScale,
        zoomPercent: Math.round(newScale * 100)
      });
    }
  },

  zoomOut: function () {
    const currentScale = this.data.scale;
    if (currentScale > 0.3) {
      const newScale = Math.max(currentScale - 0.2, 0.3);
      this.setData({
        scale: newScale,
        zoomPercent: Math.round(newScale * 100)
      });
    }
  },

  // 阿尔茨海默症缩放控制
  alzheimerZoomIn: function () {
    const currentScale = this.data.alzheimerScale;
    if (currentScale < 3) {
      const newScale = Math.min(currentScale + 0.2, 3);
      this.setData({
        alzheimerScale: newScale,
        alzheimerZoomPercent: Math.round(newScale * 100)
      });
    }
  },

  alzheimerZoomOut: function () {
    const currentScale = this.data.alzheimerScale;
    if (currentScale > 0.3) {
      const newScale = Math.max(currentScale - 0.2, 0.3);
      this.setData({
        alzheimerScale: newScale,
        alzheimerZoomPercent: Math.round(newScale * 100)
      });
    }
  },

  // 触摸事件处理
  onTouchStart: function (e) {
    if (e.touches.length === 1) {
      this.setData({
        isDragging: true,
        dragStartX: e.touches[0].clientX - this.data.translateX,
        dragStartY: e.touches[0].clientY - this.data.translateY
      });
    } else if (e.touches.length === 2) {
      // 两指触摸开始，记录初始距离和缩放比例
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = this.getDistance(touch1, touch2);
      this.setData({
        isDragging: false,
        initialDistance: distance,
        initialScale: this.data.scale
      });
    }
  },

  onTouchMove: function (e) {
    if (e.touches.length === 1 && this.data.isDragging) {
      // 单指拖拽
      const translateX = e.touches[0].clientX - this.data.dragStartX;
      const translateY = e.touches[0].clientY - this.data.dragStartY;
      this.setData({
        translateX: translateX,
        translateY: translateY
      });
    } else if (e.touches.length === 2) {
      // 两指缩放
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = this.getDistance(touch1, touch2);
      const scale = (distance / this.data.initialDistance) * this.data.initialScale;

      // 限制缩放范围在0.3-5倍之间
      const clampedScale = Math.max(0.3, Math.min(scale, 5));

      this.setData({
        scale: clampedScale,
        zoomPercent: Math.round(clampedScale * 100)
      });
    }
  },

  onTouchEnd: function () {
    this.setData({
      isDragging: false,
      initialDistance: 0,
      initialScale: 1
    });
  },

  // 计算两指间距离
  getDistance: function (touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // 防止点击穿透
  preventClose: function () {
    // 阻止事件冒泡
  }
});
