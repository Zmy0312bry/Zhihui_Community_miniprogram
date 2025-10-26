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
    scale: 1,
    scaleDisplay: '100',
    minScale: 0.3,
    maxScale: 3,
    isScrollEnabled: true, // 是否启用滚动
    isZooming: false, // 是否正在缩放中
    showRelatedLink: false, // 是否显示相关链接
    relatedLink: null, // 相关链接数据
    
    // 图片拖动和平移相关
    translateX: 0, // 水平偏移
    translateY: 0, // 竖直偏移
    isDragging: false, // 是否正在拖动
    
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
      scale: 1,
      scaleDisplay: '100',
      translateX: 0,
      translateY: 0,
      imageScales: {},
      imageDynamicHeights: {},
      imageDynamicWidths: {},
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

  // ===== 统一的触摸处理逻辑（scroll-view 和 image-zoom-container 共用） =====
  // 单一职责：根据触摸数量和距离判断操作类型，并执行相应处理
  
  handleTouchStart: function(e) {
    try {
      if (!e || !e.touches || e.touches.length === 0) return;

      // 清理上一个操作的状态
      this.resetTouchState();

      const touchCount = e.touches.length;

      if (touchCount === 1) {
        // 单指触摸 - 检查是否可以拖动
        // 只有当图片被缩放后才允许拖动
        if (this.data.scale > 1.05) {
          // 图片已缩放，允许拖动
          this.touchMode = 'drag';
          this.dragStartX = e.touches[0].clientX;
          this.dragStartY = e.touches[0].clientY;
          this.dragStartTranslateX = this.data.translateX;
          this.dragStartTranslateY = this.data.translateY;
          console.log('[Touch] 单指拖动模式激活');
        } else {
          // 图片未缩放，可以滚动
          this.touchMode = 'single';
          this.singleTouchStartY = e.touches[0].clientY;
          this.singleTouchStartX = e.touches[0].clientX;
          this.lastSingleTouchY = e.touches[0].clientY;
          this.touchStartTime = Date.now();
          console.log('[Touch] 单指滚动模式');
        }
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

      // 拖动模式：处理图片平移
      if (this.touchMode === 'drag' && touchCount === 1) {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        
        const deltaX = currentX - this.dragStartX;
        const deltaY = currentY - this.dragStartY;
        
        // 计算新的偏移量
        let newTranslateX = this.dragStartTranslateX + deltaX;
        let newTranslateY = this.dragStartTranslateY + deltaY;
        
        // 计算图片缩放后的实际尺寸和移动边界
        // 获取容器宽度（假设屏幕宽度 - padding）
        const containerWidth = wx.getSystemInfoSync().windowWidth * 0.94;
        const scaledWidth = containerWidth * this.data.scale;
        const maxTranslateX = (scaledWidth - containerWidth) / 2;
        
        // 限制水平拖动范围
        newTranslateX = Math.min(Math.max(newTranslateX, -maxTranslateX), maxTranslateX);
        
        // 竖直方向：给予更多自由度
        const maxTranslateY = 200; // 允许一定的竖直拖动
        newTranslateY = Math.min(Math.max(newTranslateY, -maxTranslateY), maxTranslateY);
        
        this.setData({
          translateX: newTranslateX,
          translateY: newTranslateY
        });
        
        console.log('[Touch] 拖动中，偏移:', { x: newTranslateX, y: newTranslateY });
      }
      // 单指模式：处理滚动
      else if (this.touchMode === 'single' && touchCount === 1) {
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

        // 计算缩放比例 - 使用平滑缩放因子
        const scaleRatio = currentDistance / this.startDistance;
        
        // 应用缓动函数，使缩放更平滑自然
        // 使用 0.85 作为敏感度因子，减少过度缩放
        const smoothRatio = 1 + (scaleRatio - 1) * 0.85;
        let newScale = this.startScale * smoothRatio;

        // 限制缩放范围
        newScale = Math.min(Math.max(newScale, this.data.minScale), this.data.maxScale);

        // 计算百分比
        const scalePercent = Math.round(newScale * 100).toString();

        this.setData({
          scale: newScale,
          scaleDisplay: scalePercent,
          isZooming: true
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
      if (this.touchMode === 'drag') {
        // 拖动操作结束
        console.log('[Touch] 拖动结束');
      } else if (this.touchMode === 'pinch') {
        // 缩放操作结束，恢复滚动并更新图片容器高度
        console.log('[Touch] 双指缩放结束，恢复滚动');
        
        // 计算缩放后的动态高度
        this.updateImageDynamicHeights();
        
        this.setData({ 
          isScrollEnabled: true,
          isZooming: false
        });
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

  // 【新增】更新图片的动态尺寸（缩放后自适应）
  updateImageDynamicHeights: function() {
    try {
      // 使用 transform: scale() 真实缩放，无需计算动态高度
      // scale 数值会应用到容器和图片上
      console.log('[缩放] 已应用 transform: scale()', this.data.scale);
    } catch (err) {
      console.error('[高度更新] 错误:', err);
    }
  },

  // 重置触摸状态
  resetTouchState: function() {
    this.touchMode = null; // 'single' | 'pinch' | 'drag' | null
    this.isSingleScrolling = false;
    this.singleTouchStartY = 0;
    this.singleTouchStartX = 0;
    this.lastSingleTouchY = 0;
    this.startDistance = 0;
    this.startScale = 1;
    this.touchStartTime = 0;
    
    // 拖动相关
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartTranslateX = 0;
    this.dragStartTranslateY = 0;
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

  // 打开外部链接（在 webview 中渲染）
  openExternalLink: function (e) {
    const url = e.currentTarget.dataset.url;
    if (!url) {
      wx.showToast({
        title: '链接地址无效',
        icon: 'none'
      });
      return;
    }
    
    console.log('打开链接:', url);
    
    // 先复制链接到剪贴板
    wx.setClipboardData({
      data: url,
      success: () => {
        // 复制成功，显示提示
        wx.showToast({
          title: '链接已复制',
          icon: 'success',
          duration: 500
        });
        
        // 延迟 0.5 秒后跳转到 webview
        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/webview/webview?url=${encodeURIComponent(url)}`,
            success: () => {
              console.log('成功跳转到 webview 页面');
            },
            fail: (err) => {
              console.error('跳转失败:', err);
              wx.showToast({
                title: '打开链接失败',
                icon: 'none'
              });
            }
          });
        }, 500);
      },
      fail: (err) => {
        console.error('复制链接失败:', err);
        // 复制失败也继续跳转
        wx.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(url)}`,
          success: () => {
            console.log('成功跳转到 webview 页面');
          },
          fail: (err) => {
            console.error('跳转失败:', err);
            wx.showToast({
              title: '打开链接失败',
              icon: 'none'
            });
          }
        });
      }
    });
  }
});
