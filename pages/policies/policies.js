// pages/policies/policies.js
const app = getApp();

Page({
  data: {
    // 展开状态
    expandedCategories: {
      care: false,
      assessment: false,
      welfare: false
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
        totalPages: 12
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
        totalPages: 20
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

    // PDF文档预览相关
    showImageViewer: false,
    currentPdfFile: '',
    currentPdfTitle: '',
    currentPdfTotalPages: 0,
    currentImageList: [],
    loadedPages: 0,
    batchSize: 2, // 每次加载2页，使单屏更容易看到一整页
    scale: 1,
    scaleDisplay: '100',
    minScale: 0.3,
    maxScale: 3,
    isScrollEnabled: true, // 是否启用滚动
    isZooming: false // 是否正在缩放中
  },

  onLoad: function (options) {
    console.log('政策法规页面加载完成');

    // 初始化触摸相关变量
    this.resetTouchState();

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
        scaleDisplay: '100'
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
      scale: 1,
      scaleDisplay: '100'
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

  // ===== 统一的触摸处理逻辑（scroll-view 和 image-zoom-container 共用） =====
  // 单一职责：根据触摸数量和距离判断操作类型，并执行相应处理
  
  handleTouchStart: function(e) {
    try {
      if (!e || !e.touches || e.touches.length === 0) return;

      // 清理上一个操作的状态
      this.resetTouchState();

      const touchCount = e.touches.length;

      if (touchCount === 1) {
        // 单指触摸 - 记录起始坐标，等待 touchmove 判断是否滑动
        this.touchMode = 'single';
        this.singleTouchStartY = e.touches[0].clientY;
        this.singleTouchStartX = e.touches[0].clientX;
        this.lastSingleTouchY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
        console.log('[Touch] 单指起始');
      } else if (touchCount === 2) {
        // 双指触摸 - 立即计算初始距离，准备缩放
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        // 只有距离足够大才认为有效的双指操作
        if (distance >= 20) {
          this.touchMode = 'pinch';
          this.startDistance = distance;
          this.startScale = this.data.scale;

          // 禁用滚动
          this.setData({ isScrollEnabled: false });
          console.log('[Touch] 双指缩放起始，距离:', distance);
        }
      }
    } catch (err) {
      console.error('[Touch] touchstart 错误:', err);
      this.resetTouchState();
    }
  },

  handleTouchMove: function(e) {
    try {
      if (!e || !e.touches || e.touches.length === 0) return;

      const touchCount = e.touches.length;

      // 单指模式：处理滚动
      if (this.touchMode === 'single' && touchCount === 1) {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - this.singleTouchStartY;

        // 只有移动足够距离才认为是有效的滚动
        if (Math.abs(deltaY) > 8) {
          // 让 scroll-view 的原生滚动处理
          // 此处我们只是记录状态，scroll-view 会自动处理
          this.isSingleScrolling = true;
          console.log('[Touch] 单指滑动中，deltaY:', deltaY);
        }
      }
      // 双指模式：处理缩放
      else if (this.touchMode === 'pinch' && touchCount === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        // 计算缩放比例
        let newScale = this.startScale * (currentDistance / this.startDistance);

        // 限制缩放范围
        newScale = Math.min(Math.max(newScale, this.data.minScale), this.data.maxScale);

        // 计算百分比
        const scalePercent = Math.round(newScale * 100).toString();

        this.setData({
          scale: newScale,
          scaleDisplay: scalePercent
        });

        // 阻止事件冒泡，防止页面滚动
        e.stopPropagation && e.stopPropagation();
        console.log('[Touch] 双指缩放中，比例:', newScale.toFixed(2));
      }
      // 如果触摸数量变化（从1变2或从2变1），重置状态
      else if (this.touchMode && ((this.touchMode === 'single' && touchCount === 2) || (this.touchMode === 'pinch' && touchCount === 1))) {
        console.log('[Touch] 触摸数量变化，重置操作');
        this.resetTouchState();
      }
    } catch (err) {
      console.error('[Touch] touchmove 错误:', err);
    }
  },

  handleTouchEnd: function(e) {
    try {
      if (this.touchMode === 'pinch') {
        // 缩放操作结束，恢复滚动
        console.log('[Touch] 双指缩放结束，恢复滚动');
        this.setData({ isScrollEnabled: true });
      } else if (this.touchMode === 'single') {
        console.log('[Touch] 单指操作结束');
      }

      this.resetTouchState();
    } catch (err) {
      console.error('[Touch] touchend 错误:', err);
      this.resetTouchState();
    }
  },

  handleTouchCancel: function(e) {
    try {
      console.log('[Touch] 触摸取消');
      // 恢复滚动状态
      this.setData({ isScrollEnabled: true });
      this.resetTouchState();
    } catch (err) {
      console.error('[Touch] touchcancel 错误:', err);
      this.resetTouchState();
    }
  },

  // 重置触摸状态
  resetTouchState: function() {
    this.touchMode = null; // 'single' | 'pinch' | null
    this.isSingleScrolling = false;
    this.singleTouchStartY = 0;
    this.singleTouchStartX = 0;
    this.lastSingleTouchY = 0;
    this.startDistance = 0;
    this.startScale = 1;
    this.touchStartTime = 0;
  },
  
  // PDF页面加载错误处理
  handleImageError: function(e) {
    const index = e.currentTarget.dataset.index;
    console.error(`PDF页面加载失败, 索引: ${index}`);
    // 可以在此添加加载失败的处理逻辑
  },
  
  // 监听滚动到底部事件，加载更多PDF页面
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
        isZooming: false,
        isScrollEnabled: true
      });
      
      console.log('成功关闭查看器');
    } catch (error) {
      console.error('关闭查看器出错:', error);
      
      // 即使出错，也要确保基本功能恢复
      this.setData({
        showImageViewer: false,
        scale: 1,
        isScrollEnabled: true
      });
    }
  },

  // 不再需要这个函数，但保留一个空实现以防止潜在引用错误
  preventClose: function () {
    // 不再需要阻止事件冒泡
    return false;
  }
});
