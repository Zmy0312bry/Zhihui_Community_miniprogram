// pages/policies/policies.js
const app = getApp();

Page({
  data: {
    // 展开状态
    expandedCategories: {
      care: false,
      assessment: false,
      welfare: false,
      subsidyList: false  // 补贴专栏展开状态
    },
    
    // 触摸和滚动状态控制
    isSingleTouch: false,
    isZooming: false,
    isScrollEnabled: true,

    // 养老照护床位政策
    carePolicies: [
      {
        id: 1,
        title: "海淀区养老家庭照护床位服务宣传海报",
        file: "pdf1.pdf",
        desc: "养老家庭照护床位服务相关宣传内容",
        totalPages: 2
      },
      {
        id: 2,
        title: "海淀区民政局关于印发《海淀区养老家庭照护床位护理服务机构管理办法（试行）》的通知",
        file: "pdf3.pdf",
        desc: "养老家庭照护床位护理服务机构管理办法",
        totalPages: 36
      },
      {
        id: 5,
        title: "海淀区民政局关于印发《海淀区养老家庭照护床位建设管理实施细则》",
        file: "pdf5.pdf",
        desc: "养老家庭照护床位建设管理实施细则",
        totalPages: 12,
        relatedLink: {
          title: "《海淀区养老家庭照护床位建设管理实施细则》",
          url: "https://zyk.bjhd.gov.cn/zwdt/zcjd/202408/t20240821_4666403.shtml"
        }
      }
    ],

    // 老年人能力评估政策
    assessmentPolicies: [
      {
        id: 3,
        title: "关于消化存量评估攻坚行动实施方案的通知",
        file: "pdf2.pdf",
        desc: "消化存量评估攻坚行动实施方案",
        totalPages: 14
      },
      {
        id: 4,
        title: "北京市老年人能力评估实施办法",
        file: "pdf4.pdf",
        desc: "老年人能力评估相关实施办法",
        totalPages: 20,
        relatedLink: {
          title: "北京市老年人能力评估实施办法",
          url: "https://mzj.beijing.gov.cn/art/2022/8/25/art_10688_1398.html"
        }
      }
    ],

    // 老年人福利政策
    welfarePolicies: [
      {
        id: 6,
        title: "养老服务专项补贴政策",
        file: app.getMediaUrl('fuwu.png'),
        desc: "养老服务专项补贴相关政策内容",
        totalPages: 1
      },
      {
        id: 7,
        title: "老年人福利服务政策",
        file: app.getMediaUrl('fuwu.jpg'),
        desc: "老年人福利服务相关政策内容",
        totalPages: 1
      },
      {
        id: 8,
        title: "老年人福利补贴政策",
        file: app.getMediaUrl('fuli.jpg'),
        desc: "老年人福利补贴相关政策内容",
        totalPages: 1
      }
    ],

    // 办事指南链接（直接跳转）
    servicesGuide: {
      title: "老年人津贴办事指南",
      desc: "快速了解津贴办理流程",
      url: "https://banshi.beijing.gov.cn/pubtask/task/1/110108000000/6d2eb720-30ae-4774-8d77-77b2699c96c0.html?locationCode=110108000000#Guide-btn"
    },

    // 补贴专栏子项目
    subsidyItems: [
      {
        id: 1,
        title: "失能老年人护理补贴",
        desc: "为失能老年人提供护理补贴相关政策",
        url: "https://banshi.beijing.gov.cn/pubtask/task/1/110108000000/a9c07314-8af5-42ff-b0d1-ea7ff870f654.html?locationCode=110108000000#Guide-btn"
      },
      {
        id: 2,
        title: "困难老年人养老服务补贴",
        desc: "为困难老年人提供养老服务补贴政策",
        url: "https://banshi.beijing.gov.cn/pubtask/task/1/110108000000/1f397221-3db4-4dfd-89d2-9f3483d2774e.html?locationCode=110108000000"
      },
      {
        id: 3,
        title: "高龄老年人津贴",
        desc: "为高龄老年人提供专项津贴政策",
        url: "https://banshi.beijing.gov.cn/pubtask/task/1/110108000000/6d2eb720-30ae-4774-8d77-77b2699c96c0.html?locationCode=110108000000#Guide-btn"
      }
    ],

    // PDF文档预览相关
    showImageViewer: false,
    currentPdfFile: '',
    currentPdfTitle: '',
    currentPdfTotalPages: 0,
    currentImageList: [],
    loadedPages: 0,
    batchSize: 2, // 每次加载2页，使单屏更容易看到一整页
    isLoadingMore: false, // 是否正在加载更多页面
    
    // 新的缩放和拖拽系统
    imageScale: 1,
    translateX: 0,
    translateY: 0,
    isImageZoomed: false,
    
    // 触摸状态
    touchMode: null, // 'none', 'pan', 'zoom'
    lastTouchTime: 0,
    
    // 双指缩放
    initialDistance: 0,
    initialScale: 1,
    
    // 单指拖拽
    lastTouchX: 0,
    lastTouchY: 0,
    dragStartX: 0,
    dragStartY: 0,
    
    showRelatedLink: false, // 是否显示相关链接
    relatedLink: null, // 相关链接数据
    
    // 图片尺寸追踪
    imageScales: {}, // 存储每张图片的原始宽高: { url: { width, height, containerWidth, containerHeight } }
    imageDynamicHeights: {}, // 存储每张图片缩放后的动态高度: { url: height }
    imageDynamicWidths: {}, // 存储每张图片缩放后的动态宽度: { url: width }
    viewerContainerWidth: 0 // 记录视图容器宽度，供图片初始展示使用
  },

  onLoad: function (options) {
    console.log('政策法规页面加载完成');

    // 初始化触摸相关变量
    this.resetTouchState();

    // 预先计算图片容器宽度，供初始展示和兜底使用
    try {
      const systemInfo = wx.getSystemInfoSync();
      const viewerContainerWidth = Math.floor(systemInfo.windowWidth * 0.94);
      this.viewerContainerWidth = viewerContainerWidth;
      this.setData({ viewerContainerWidth });
    } catch (err) {
      console.warn('获取系统信息失败，使用默认容器宽度', err);
    }

    // 确保初始状态正确
    this.setData({
      isScrollEnabled: true,
      isZooming: false,
      scale: 1,
      scaleDisplay: '100'
    });

    // 设置页面滚动配置
    if (wx.pageScrollTo) {
      // 确保页面滚动到顶部
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      });
    }
  },

  onShow: function () {
    // 页面显示时的处理
    // 确保触摸状态正确重置
    this.resetTouchState();
    this.setData({
      isScrollEnabled: true,
      isZooming: false
    });
  },

  // 切换分类展开状态
  toggleCategory: function (e) {
    const category = e.currentTarget.dataset.category;
    const expandedCategories = this.data.expandedCategories;

    this.setData({
      [`expandedCategories.${category}`]: !expandedCategories[category]
    });
  },

  // 查看PDF文档或图片
  viewPdfImages: function (e) {
    const file = e.currentTarget.dataset.file;
    const title = e.currentTarget.dataset.title;
    const totalPages = e.currentTarget.dataset.pages;
    const relatedLink = e.currentTarget.dataset.relatedLink;
    
    // 检查是否为直接图片URL（以http开头）
    if (file.startsWith('http')) {
      // 直接图片URL的情况
      console.log('查看图片文档:', file, title, totalPages);
      
      const imageList = [{
        url: file,
        page: 1
      }];
      
      // 显示图片预览
      this.setData({
        showImageViewer: true,
        currentPdfFile: file,
        currentPdfTitle: title,
        currentPdfTotalPages: parseInt(totalPages),
        currentImageList: imageList,
        loadedPages: 1,
        scale: 1,
        scaleDisplay: '100',
        translateX: 0,
        translateY: 0,
        imageScales: {},
        imageDynamicHeights: {},
        imageDynamicWidths: {},
        showRelatedLink: false,
        relatedLink: null
      });
      
      console.log('图片预览已显示');
      return;
    }
    
    // PDF文件的情况
    const pdfNum = file.replace('.pdf', ''); // 获取pdf编号
    const baseDir = pdfNum; // 图片目录名
    
    console.log('查看PDF文档:', file, title, totalPages, baseDir);
    
    // 初始化图片列表，先加载前4张或全部（如果总页数小于4）
    const initialLoadCount = Math.min(this.data.batchSize, totalPages);
    let imageList = [];
    
    for (let i = 1; i <= initialLoadCount; i++) {
      // 构建图片URL, 格式: pdf文件夹/pdf编号_页码.jpg
      const imageUrl = app.getFileUrl(`${baseDir}/${pdfNum}_${i}.jpg`);
      imageList.push({
        url: imageUrl,
        page: i
      });
    }
    
    // 显示PDF预览
    this.setData({
      showImageViewer: true,
      currentPdfFile: file,
      currentPdfTitle: title,
      currentPdfTotalPages: parseInt(totalPages),
      currentImageList: imageList,
      loadedPages: initialLoadCount,
      imageScale: 1,
      translateX: 0,
      translateY: 0,
      isImageZoomed: false,
      imageScales: {},
      showRelatedLink: !!relatedLink, // 如果有相关链接，显示
      relatedLink: relatedLink || null
    });
    
    console.log('PDF图片预览已显示');
  },
  
  // 加载更多图片
  loadMoreImages: function() {
    // 如果已经加载完所有图片，则不再加载
    if (this.data.loadedPages >= this.data.currentPdfTotalPages) {
      return;
    }
    
    const pdfNum = this.data.currentPdfFile.replace('.pdf', '');
    const baseDir = pdfNum;
    const nextBatch = Math.min(this.data.batchSize, this.data.currentPdfTotalPages - this.data.loadedPages);
    let newImageList = [...this.data.currentImageList];
    
    for (let i = 1; i <= nextBatch; i++) {
      const pageNum = this.data.loadedPages + i;
      const imageUrl = app.getFileUrl(`${baseDir}/${pdfNum}_${pageNum}.jpg`);
      newImageList.push({
        url: imageUrl,
        page: pageNum
      });
    }
    
    this.setData({
      currentImageList: newImageList,
      loadedPages: this.data.loadedPages + nextBatch
    });
    
    console.log(`已加载 ${this.data.loadedPages} / ${this.data.currentPdfTotalPages} 页`);
  },

  // ===== 图片尺寸追踪和缩放优化 =====
  // 获取图片实际尺寸
  handleImageLoad: function(e) {
    try {
      const { width, height } = e.detail;
      const url = e.currentTarget.dataset.url;
      
      if (!url) {
        console.warn('图片URL未找到');
        return;
      }

      // 计算容器尺寸
      wx.getSystemInfo({
        success: (res) => {
          const windowWidth = res.windowWidth;
          const containerWidth = Math.floor(windowWidth * 0.94); // 94% 宽度，匹配 WXSS 中的设置
          
          // 计算按原宽度自适应显示时的实际高度
          const containerHeight = Math.floor(containerWidth * (height / width));
          
          // 保存图片尺寸信息
          const imageScales = this.data.imageScales || {};
          imageScales[url] = {
            originalWidth: width,
            originalHeight: height,
            containerWidth: containerWidth,
            containerHeight: containerHeight,
            aspectRatio: height / width
          };
          
          // 【新增】初始化该图片的容器尺寸（用于 min-height 和图片原始宽度）
          const imageDynamicHeights = this.data.imageDynamicHeights || {};
          const imageDynamicWidths = this.data.imageDynamicWidths || {};
          imageDynamicHeights[url] = containerHeight;
          imageDynamicWidths[url] = containerWidth;
          
          this.setData({ 
            imageScales,
            imageDynamicHeights,
            imageDynamicWidths
          });
          
          console.log(`图片加载完成 [${url}]：原始尺寸 ${width}x${height}，容器尺寸 ${containerWidth}x${containerHeight}，初始高度 ${imageDynamicHeights[url]}`);
        }
      });
    } catch (err) {
      console.error('处理图片加载错误:', err);
    }
  },

  // 处理图片加载错误
  handleImageError: function(e) {
    const url = e.currentTarget.dataset.url;
    console.error('图片加载失败:', url, e.detail);
    
    wx.showToast({
      title: '图片加载失败',
      icon: 'error',
      duration: 1000
    });
  },

  // ===== 全新的触摸交互系统 =====
  
  onImageTouchStart: function(e) {
    if (!e.touches || e.touches.length === 0) return;
    
    this.lastTouchTime = Date.now();
    
    if (e.touches.length === 1) {
      // 单指触摸
      const touch = e.touches[0];
      this.lastTouchX = touch.clientX;
      this.lastTouchY = touch.clientY;
      this.dragStartX = this.data.translateX;
      this.dragStartY = this.data.translateY;
      
      if (this.data.imageScale > 1.1) {
        // 图片已缩放，启用拖拽
        this.touchMode = 'pan';
      } else {
        this.touchMode = 'none';
      }
    } else if (e.touches.length === 2) {
      // 双指触摸，准备缩放
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      this.initialDistance = this.getDistance(touch1, touch2);
      this.initialScale = this.data.imageScale;
      this.touchMode = 'zoom';
      
      console.log('[Touch] 双指缩放开始，初始距离:', this.initialDistance);
    }
  },
  
  onImageTouchMove: function(e) {
    if (!e.touches || e.touches.length === 0) return;
    
    if (this.touchMode === 'pan' && e.touches.length === 1) {
      // 单指拖拽
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.lastTouchX;
      const deltaY = touch.clientY - this.lastTouchY;
      
      const newTranslateX = this.dragStartX + deltaX;
      const newTranslateY = this.dragStartY + deltaY;
      
      // 限制拖拽范围
      const maxTranslateX = 100;
      const maxTranslateY = 150;
      
      const boundedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
      const boundedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
      
      this.setData({
        translateX: boundedX,
        translateY: boundedY
      });
      
    } else if (this.touchMode === 'zoom' && e.touches.length === 2) {
      // 双指缩放
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const currentDistance = this.getDistance(touch1, touch2);
      const scaleRatio = currentDistance / this.initialDistance;
      let newScale = this.initialScale * scaleRatio;
      
      // 限制缩放范围
      newScale = Math.max(0.5, Math.min(3, newScale));
      
      const isZoomed = newScale > 1.1;
      
      this.setData({
        imageScale: newScale,
        isImageZoomed: isZoomed
      });
    }
  },
  
  onImageTouchEnd: function(e) {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - this.lastTouchTime;
    
    if (this.touchMode === 'zoom') {
      // 缩放结束，检查是否需要重置位置
      if (this.data.imageScale <= 1.1) {
        this.setData({
          translateX: 0,
          translateY: 0,
          isImageZoomed: false
        });
      } else {
        this.setData({
          isImageZoomed: true
        });
      }
    } else if (this.touchMode === 'none' && touchDuration < 300) {
      // 短触摸，可能是点击事件
      console.log('[Touch] 短触摸检测');
    }
    
    this.touchMode = null;
  },
  
  onImageTouchCancel: function(e) {
    this.touchMode = null;
    console.log('[Touch] 触摸取消');
  },
  
  // 计算两点间距离
  getDistance: function(touch1, touch2) {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  },
  
  // 图片加载完成
  onImageLoad: function(e) {
    const { width, height } = e.detail;
    const url = e.currentTarget.dataset.url;
    
    if (!url) return;
    
    // 获取系统信息来计算容器宽度
    wx.getSystemInfo({
      success: (res) => {
        const containerWidth = Math.floor(res.windowWidth * 0.9);
        const containerHeight = Math.floor(containerWidth * (height / width));
        
        const imageScales = this.data.imageScales || {};
        imageScales[url] = {
          originalWidth: width,
          originalHeight: height,
          containerWidth: containerWidth,
          containerHeight: containerHeight,
          aspectRatio: height / width
        };
        
        this.setData({ imageScales });
        
        console.log(`[Image] 加载完成: ${width}x${height} -> ${containerWidth}x${containerHeight}`);
      }
    });
  },
  
  // 图片加载错误
  onImageError: function(e) {
    const url = e.currentTarget.dataset.url;
    console.error('[Image] 加载失败:', url);
    
    wx.showToast({
      title: '图片加载失败',
      icon: 'error',
      duration: 1500
    });
  },

  // 处理滚动到底部，加载更多页面
  handleScrollToLower: function() {
    console.log('滚动到底部，加载更多PDF页面');
    this.loadMoreImages();
  },

  // 关闭PDF预览，返回政策目录
  closeImageViewer: function () {
    console.log('返回政策目录');
    
    // 如果正在缩放中，忽略返回操作，防止误触
    if (this.data.isZooming) {
      console.log('正在缩放中，忽略返回操作');
      return;
    }
    
    try {
      // 震动反馈 - 使用try-catch防止可能的API调用异常
      try {
        if (wx.vibrateShort) {
          wx.vibrateShort({ type: 'light' });
        }
      } catch (err) {
        console.log('震动API不可用', err);
      }
      
      // 使用动画效果关闭预览
      wx.showToast({
        title: '返回政策目录',
        icon: 'none',
        duration: 500
      });
      
      // 重置触摸相关变量
      this.resetTouchState();
      
      // 重置预览状态 - 直接关闭而不使用延时，避免潜在问题
      this.setData({
        showImageViewer: false,
        currentPdfFile: '',
        currentPdfTitle: '',
        currentImageList: [],
        loadedPages: 0,
        scale: 1,
        scaleDisplay: '100',
        translateX: 0,
        translateY: 0,
        isZooming: false,
  isScrollEnabled: true,
  imageScales: {}, // 清理图片尺寸数据
  imageDynamicHeights: {},
  imageDynamicWidths: {} // 清理动态尺寸数据
      });
      
      console.log('成功关闭查看器');
    } catch (error) {
      console.error('关闭查看器出错:', error);
      
      // 即使出错，也要确保基本功能恢复
      this.setData({
        showImageViewer: false,
        scale: 1,
        translateX: 0,
        translateY: 0,
        isScrollEnabled: true,
        imageScales: {},
        imageDynamicHeights: {},
        imageDynamicWidths: {}
      });
    }
  },

  // 不再需要这个函数，但保留一个空实现以防止潜在引用错误
  preventClose: function () {
    // 不再需要阻止事件冒泡
    return false;
  },

  // 打开外部链接（仅复制链接并提示）
  openExternalLink: function (e) {
    const url = e.currentTarget.dataset.url;
    if (!url) {
      wx.showToast({
        title: '链接地址无效',
        icon: 'none'
      });
      return;
    }

    console.log('复制链接:', url);

    // 复制链接到剪贴板
    wx.setClipboardData({
      data: url,
      success: () => {
        // 复制成功，显示提示
        wx.showToast({
          title: '链接已复制，请到浏览器打开',
          icon: 'none', // 使用 'none' 以便显示更长的文本
          duration: 2500 // 持续2.5秒，让用户有足够时间阅读
        });
      },
      fail: (err) => {
        console.error('复制链接失败:', err);
        wx.showToast({
          title: '复制失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 图片触摸开始
  onImageTouchStart(e) {
    const touches = e.touches;
    if (touches.length === 1) {
      // 单指触摸，记录初始位置
      this.setData({
        lastTouchX: touches[0].clientX,
        lastTouchY: touches[0].clientY,
        startTouchX: touches[0].clientX,
        startTouchY: touches[0].clientY,
        isTwoFinger: false
      });
    } else if (touches.length === 2) {
      // 双指触摸，记录缩放信息
      const distance = this.getDistance(touches[0], touches[1]);
      this.setData({
        lastDistance: distance,
        isTwoFinger: true
      });
    }
  },

  // 图片触摸移动
  onImageTouchMove(e) {
    const touches = e.touches;
    if (touches.length === 1 && !this.data.isTwoFinger && this.data.isImageZoomed) {
      // 单指拖拽（缩放状态下）
      const deltaX = touches[0].clientX - this.data.lastTouchX;
      const deltaY = touches[0].clientY - this.data.lastTouchY;
      
      this.setData({
        translateX: this.data.translateX + deltaX,
        translateY: this.data.translateY + deltaY,
        lastTouchX: touches[0].clientX,
        lastTouchY: touches[0].clientY
      });
    } else if (touches.length === 2) {
      // 双指缩放
      const distance = this.getDistance(touches[0], touches[1]);
      const scale = distance / this.data.lastDistance;
      let newScale = this.data.imageScale * scale;
      
      // 限制缩放范围
      newScale = Math.max(0.5, Math.min(4, newScale));
      
      const isZoomed = newScale > 1.1;
      
      this.setData({
        imageScale: newScale,
        isImageZoomed: isZoomed,
        lastDistance: distance,
        scaleDisplay: Math.round(newScale * 100)
      });
      
      // 如果缩放回到接近原始大小，重置位移
      if (newScale <= 1.1) {
        this.setData({
          translateX: 0,
          translateY: 0
        });
      }
    }
  },

  // 图片触摸结束
  onImageTouchEnd(e) {
    // 检查是否为点击事件（单指且没有移动太多）
    if (!this.data.isTwoFinger && this.data.startTouchX && this.data.startTouchY) {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = Math.abs(endX - this.data.startTouchX);
      const deltaY = Math.abs(endY - this.data.startTouchY);
      
      // 如果移动距离很小，认为是点击
      if (deltaX < 10 && deltaY < 10 && !this.data.isImageZoomed) {
        // 在未缩放状态下点击，关闭查看器
        this.closeImageViewer();
      }
    }
    
    // 重置触摸状态
    this.setData({
      isTwoFinger: false,
      startTouchX: null,
      startTouchY: null
    });
  },

  // 图片触摸取消
  onImageTouchCancel(e) {
    this.onImageTouchEnd(e);
  },

  // 计算两点距离
  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // 滚动到底部加载更多
  handleScrollToLower() {
    if (this.data.loadedPages < this.data.currentPdfTotalPages && !this.data.isLoadingMore) {
      this.loadMorePages();
    }
  },

  // 加载更多页面
  loadMorePages() {
    const { loadedPages, currentPdfTotalPages, currentImageList } = this.data;
    if (loadedPages >= currentPdfTotalPages) return;

    this.setData({ isLoadingMore: true });

    // 使用与原始方法相同的URL生成逻辑
    const pdfNum = this.data.currentPdfFile.replace('.pdf', '');
    const baseDir = pdfNum;
    const nextPages = Math.min(5, currentPdfTotalPages - loadedPages);
    const newPages = [];

    for (let i = 1; i <= nextPages; i++) {
      const pageNum = loadedPages + i;
      const imageUrl = app.getFileUrl(`${baseDir}/${pdfNum}_${pageNum}.jpg`);
      newPages.push({
        url: imageUrl,
        page: pageNum
      });
    }

    this.setData({
      currentImageList: [...currentImageList, ...newPages],
      loadedPages: loadedPages + nextPages,
      isLoadingMore: false
    });
  },

  // 图片加载完成
  onImageLoad(e) {
    console.log('图片加载完成:', e.detail);
  },

  // 图片加载失败
  onImageError(e) {
    console.error('图片加载失败:', e.detail);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    });
  },

  // 关闭图片查看器
  closeImageViewer() {
    this.setData({
      showImageViewer: false,
      currentImageUrl: '',
      imageScale: 1,
      translateX: 0,
      translateY: 0,
      isImageZoomed: false
    });
  }
});
