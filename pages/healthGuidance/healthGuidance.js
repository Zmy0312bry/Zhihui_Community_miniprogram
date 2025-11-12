// pages/healthGuidance/healthGuidance.js
const app = getApp();

Page({
  data: {
    // 心肺复苏类型选择
    cprTypes: [
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
    selectedCPRIndex: 0, // 选中的 CPR 类型索引

    // 健康知识云课堂数据
    videoLibrary: {
      chapters: [
        {
          id: 1,
          title: "高血压防治",
          desc: "高血压的西医与中医防治知识",
          lessons: [
            { id: 2, name: "高血压的概述", duration: "07:59", videoUrl: "https://shangdi.bjseeyoung.com/media/video/2.mp4" },
            { id: 3, name: "高血压的中医防治", duration: "08:47", videoUrl: "https://shangdi.bjseeyoung.com/media/video/3.mp4" },
            { id: 10, name: "高血压运动指南", duration: "24:35", videoUrl: "https://shangdi.bjseeyoung.com/media/video/10.mp4" }
          ]
        },
        {
          id: 2,
          title: "糖尿病防治",
          desc: "糖尿病的西医与中医防治知识",
          lessons: [
            { id: 9, name: "糖尿病概述", duration: "06:44", videoUrl: "https://shangdi.bjseeyoung.com/media/video/9.mp4" },
            { id: 1, name: "糖尿病的西医防治", duration: "08:48", videoUrl: "https://shangdi.bjseeyoung.com/media/video/1.mp4" },
            { id: 8, name: "糖尿病的中医防治", duration: "08:37", videoUrl: "https://shangdi.bjseeyoung.com/media/video/8.mp4" },
            { id: 12, name: "中医对糖尿病的认识", duration: "06:27", videoUrl: "https://shangdi.bjseeyoung.com/media/video/12.mp4" }
          ]
        },
        {
          id: 3,
          title: "高血脂防治",
          desc: "高血脂的西医与中医防治知识",
          lessons: [
            { id: 4, name: "高血脂的概述", duration: "06:50", videoUrl: "https://shangdi.bjseeyoung.com/media/video/4.mp4" },
            { id: 5, name: "高血脂的中医防治", duration: "06:55", videoUrl: "https://shangdi.bjseeyoung.com/media/video/5.mp4" },
            { id: 11, name: "中医对高血脂的认识", duration: "06:23", videoUrl: "https://shangdi.bjseeyoung.com/media/video/11.mp4" }
          ]
        },
        {
          id: 4,
          title: "健康生活指导",
          desc: "慢性病防治与生活方式指导",
          lessons: [
            { id: 6, name: "慢性病中西医防治概述", duration: "11:19", videoUrl: "https://shangdi.bjseeyoung.com/media/video/6.mp4" },
            { id: 7, name: "如何调节手机微信字体大小", duration: "02:41", videoUrl: "https://shangdi.bjseeyoung.com/media/video/7.mp4" }
          ]
        }
      ]
    },
    selectedChapterIndex: 0, // 选中的章节索引
    selectedLessonId: null, // 选中的课程ID
    showVideoPlayer: false, // 是否显示视频播放器
    currentVideoTitle: '', // 当前视频标题
    currentVideoUrl: '', // 当前视频URL
    videoLoading: false, // 视频是否正在加载
    videoElement: null, // 视频元素引用

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
    
    // CPR 触摸相关
    cprTouchMode: null,
    cprInitialPinchDistance: 0,
    cprInitialScale: 1,
    cprIsDragging: false,
    cprDragStartX: 0,
    cprDragStartY: 0,
    cprTranslateX: 0,
    cprTranslateY: 0,

    // 阿尔茨海默症幻灯片预览
    showAlzheimerViewer: false,
    alzheimerCurrentSlide: 1,
    alzheimerScale: 1,
    alzheimerZoomPercent: 100,
    
    // 阿尔茨海默症触摸相关
    alzheimerTouchMode: null,
    alzheimerInitialPinchDistance: 0,
    alzheimerInitialScale: 1,
    alzheimerIsDragging: false,
    alzheimerDragStartX: 0,
    alzheimerDragStartY: 0,
    alzheimerTranslateX: 0,
    alzheimerTranslateY: 0,
    alzheimerSwipeStartX: 0,
    alzheimerSwipeStartY: 0
  },

  onLoad: function (options) {
    this.initAlzheimerSlides();
  },

  onShow: function () {
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

  // 选择视频章节
  selectVideoChapter: function (e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      selectedChapterIndex: index,
      selectedLessonId: null // 重置课程选择
    });
  },

  // 选择视频课程
  selectVideoLesson: function (e) {
    const lessonId = e.currentTarget.dataset.lessonId;
    const lessonName = e.currentTarget.dataset.lessonName;
    const videoUrl = e.currentTarget.dataset.videoUrl;
    
    this.setData({
      selectedLessonId: lessonId,
      currentVideoTitle: lessonName,
      currentVideoUrl: videoUrl,
      showVideoPlayer: true,
      videoLoading: true
    });
    
    // 延迟获取视频元素
    setTimeout(() => {
      this.videoElement = wx.createVideoContext('videoPlayer', this);
    }, 100);
  },

  // 关闭视频播放器
  closeVideoPlayer: function () {
    // 先暂停视频，避免 play/pause 冲突
    if (this.videoElement) {
      try {
        this.videoElement.pause();
      } catch (e) {
        console.warn('暂停视频失败:', e);
      }
    }
    
    this.setData({
      showVideoPlayer: false,
      selectedLessonId: null,
      currentVideoTitle: '',
      currentVideoUrl: '',
      videoLoading: false
    });
    
    this.videoElement = null;
  },

  // 选择 CPR 类型
  selectCPRType: function (e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      selectedCPRIndex: index
    });
  },

  // 查看选中的 CPR 图片
  viewSelectedCPRImage: function () {
    const selectedCPR = this.data.cprTypes[this.data.selectedCPRIndex];
    if (!selectedCPR) return;

    this.setData({
      showImageViewer: true,
      currentImage: selectedCPR.image,
      currentImageTitle: selectedCPR.title,
      scale: 1,
      zoomPercent: 100,
      cprTouchMode: null,
      cprInitialPinchDistance: 0,
      cprInitialScale: 1,
      cprIsDragging: false,
      cprDragStartX: 0,
      cprDragStartY: 0,
      cprTranslateX: 0,
      cprTranslateY: 0
    });
  },

  // 查看阿尔茨海默症幻灯片
  viewAlzheimerSlides: function () {
    this.setData({
      showAlzheimerViewer: true,
      alzheimerCurrentSlide: 1,
      alzheimerScale: 1,
      alzheimerZoomPercent: 100,
      alzheimerTouchMode: null,
      alzheimerInitialPinchDistance: 0,
      alzheimerInitialScale: 1,
      alzheimerIsDragging: false,
      alzheimerDragStartX: 0,
      alzheimerDragStartY: 0,
      alzheimerTranslateX: 0,
      alzheimerTranslateY: 0,
      alzheimerSwipeStartX: 0,
      alzheimerSwipeStartY: 0
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
      cprTouchMode: null,
      cprInitialPinchDistance: 0,
      cprInitialScale: 1,
      cprIsDragging: false,
      cprDragStartX: 0,
      cprDragStartY: 0,
      cprTranslateX: 0,
      cprTranslateY: 0
    });
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },

  // 关闭阿尔茨海默症预览
  closeAlzheimerViewer: function () {
    this.setData({
      showAlzheimerViewer: false,
      alzheimerCurrentSlide: 1,
      alzheimerScale: 1,
      alzheimerZoomPercent: 100,
      alzheimerTouchMode: null,
      alzheimerInitialPinchDistance: 0,
      alzheimerInitialScale: 1,
      alzheimerIsDragging: false,
      alzheimerDragStartX: 0,
      alzheimerDragStartY: 0,
      alzheimerTranslateX: 0,
      alzheimerTranslateY: 0,
      alzheimerSwipeStartX: 0,
      alzheimerSwipeStartY: 0
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
        alzheimerTranslateX: 0,
        alzheimerTranslateY: 0,
        alzheimerIsDragging: false,
        alzheimerTouchMode: null
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
        alzheimerTranslateX: 0,
        alzheimerTranslateY: 0,
        alzheimerIsDragging: false,
        alzheimerTouchMode: null
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

  // 计算两指间距离
  getDistance: function (touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // ============== 心肺复苏 (CPR) 触摸处理 ==============
  onCPRTouchStart: function (e) {
    const touches = e.touches;

    // 双指缩放
    if (touches.length === 2) {
      this.setData({
        cprTouchMode: 'pinch',
        cprInitialPinchDistance: this.getDistance(touches[0], touches[1]),
        cprInitialScale: this.data.scale
      });
    }
    // 单指拖拽（放大时才允许）
    else if (touches.length === 1 && this.data.scale > 1) {
      const touch = touches[0];
      this.setData({
        cprTouchMode: 'drag',
        cprIsDragging: true,
        cprDragStartX: touch.clientX - this.data.cprTranslateX,
        cprDragStartY: touch.clientY - this.data.cprTranslateY
      });
    }
  },

  onCPRTouchMove: function (e) {
    const touches = e.touches;

    // 双指缩放处理
    if (this.data.cprTouchMode === 'pinch' && touches.length === 2) {
      const currentDistance = this.getDistance(touches[0], touches[1]);
      const initialDistance = this.data.cprInitialPinchDistance;

      if (initialDistance > 0) {
        const ratio = currentDistance / initialDistance;
        let newScale = this.data.cprInitialScale * ratio;

        // 限制缩放范围：1x 到 8x（100% 到 800%）
        if (newScale < 1) newScale = 1;
        if (newScale > 8) newScale = 8;

        this.setData({
          scale: newScale,
          zoomPercent: Math.round(newScale * 100)
        });
      }
    }
    // 单指拖拽处理（放大时允许拖拽）
    else if (this.data.cprTouchMode === 'drag' && touches.length === 1 && this.data.cprIsDragging) {
      const touch = touches[0];
      const newTranslateX = touch.clientX - this.data.cprDragStartX;
      const newTranslateY = touch.clientY - this.data.cprDragStartY;

      // 限制拖拽范围
      const maxTranslate = (this.data.scale - 1) * 100;
      const limitedX = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateX));
      const limitedY = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateY));

      this.setData({
        cprTranslateX: limitedX,
        cprTranslateY: limitedY
      });
    }
  },

  onCPRTouchEnd: function (e) {
    this.setData({
      cprTouchMode: null,
      cprIsDragging: false,
      cprInitialPinchDistance: 0,
      cprInitialScale: 1
    });
  },

  // ============== 阿尔茨海默症触摸处理 ==============
  onAlzheimerTouchStart: function (e) {
    const touches = e.touches;

    // 双指缩放
    if (touches.length === 2) {
      this.setData({
        alzheimerTouchMode: 'pinch',
        alzheimerInitialPinchDistance: this.getDistance(touches[0], touches[1]),
        alzheimerInitialScale: this.data.alzheimerScale
      });
    }
    // 单指拖拽（用于页面切换和拖动）
    else if (touches.length === 1) {
      const touch = touches[0];
      this.setData({
        alzheimerTouchMode: 'swipe',
        alzheimerSwipeStartX: touch.clientX,
        alzheimerSwipeStartY: touch.clientY,
        alzheimerDragStartX: touch.clientX - this.data.alzheimerTranslateX,
        alzheimerDragStartY: touch.clientY - this.data.alzheimerTranslateY,
        alzheimerIsDragging: true
      });
    }
  },

  onAlzheimerTouchMove: function (e) {
    const touches = e.touches;

    // 双指缩放处理
    if (this.data.alzheimerTouchMode === 'pinch' && touches.length === 2) {
      const currentDistance = this.getDistance(touches[0], touches[1]);
      const initialDistance = this.data.alzheimerInitialPinchDistance;

      if (initialDistance > 0) {
        const ratio = currentDistance / initialDistance;
        let newScale = this.data.alzheimerInitialScale * ratio;

        // 限制缩放范围：1x 到 8x（100% 到 800%）
        if (newScale < 1) newScale = 1;
        if (newScale > 8) newScale = 8;

        this.setData({
          alzheimerScale: newScale,
          alzheimerZoomPercent: Math.round(newScale * 100)
        });
      }
    }
    // 单指拖拽处理
    else if (this.data.alzheimerTouchMode === 'swipe' && touches.length === 1 && this.data.alzheimerIsDragging) {
      const touch = touches[0];
      const deltaX = touch.clientX - this.data.alzheimerSwipeStartX;
      const deltaY = touch.clientY - this.data.alzheimerSwipeStartY;

      // 如果当前图片已缩放，允许拖拽；否则检测左右滑动用于页面切换
      if (this.data.alzheimerScale > 1) {
        // 图片放大时，允许拖拽
        const newTranslateX = touch.clientX - this.data.alzheimerDragStartX;
        const newTranslateY = touch.clientY - this.data.alzheimerDragStartY;

        // 限制拖拽范围
        const maxTranslate = (this.data.alzheimerScale - 1) * 100;
        const limitedX = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateX));
        const limitedY = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateY));

        this.setData({
          alzheimerTranslateX: limitedX,
          alzheimerTranslateY: limitedY
        });
      }
    }
  },

  onAlzheimerTouchEnd: function (e) {
    // 如果是单指滑动且未缩放，检测是否为左右翻页滑动
    if (this.data.alzheimerTouchMode === 'swipe' && this.data.alzheimerScale === 1) {
      const deltaX = e.changedTouches[0].clientX - this.data.alzheimerSwipeStartX;
      const deltaY = e.changedTouches[0].clientY - this.data.alzheimerSwipeStartY;

      // 检查是水平滑动（|deltaX| > |deltaY| 且 |deltaX| > 50px）
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // 向右滑动，上一页
          this.prevSlide();
        } else {
          // 向左滑动，下一页
          this.nextSlide();
        }
      }
    }

    this.setData({
      alzheimerTouchMode: null,
      alzheimerIsDragging: false,
      alzheimerInitialPinchDistance: 0,
      alzheimerInitialScale: 1,
      alzheimerSwipeStartX: 0,
      alzheimerSwipeStartY: 0,
      alzheimerTranslateX: 0,
      alzheimerTranslateY: 0
    });
  },

  // ============== 视频事件处理 ==============
  // 视频元数据加载完成
  onVideoLoadedMetadata: function (e) {
    console.log('视频元数据加载完成', e);
    this.setData({ videoLoading: false });
  },

  // 视频可播放的数据已加载
  onVideoLoadedData: function (e) {
    console.log('视频数据加载完成', e);
    this.setData({ videoLoading: false });
  },

  // 视频播放开始
  onVideoPlay: function (e) {
    console.log('视频开始播放');
    this.setData({ videoLoading: false });
  },

  // 视频暂停
  onVideoPause: function (e) {
    console.log('视频暂停');
  },

  // 视频加载失败
  onVideoError: function (e) {
    console.error('视频加载失败:', e.detail.errMsg);
    this.setData({ videoLoading: false });
    wx.showToast({
      title: '视频加载失败，请检查网络',
      icon: 'none',
      duration: 2000
    });
  },

  // 防止点击穿透
  preventClose: function () {
    // 阻止事件冒泡
  }
});
