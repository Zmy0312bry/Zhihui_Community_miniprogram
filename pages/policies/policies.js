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
        relatedLinks: [
          {
            title: "《海淀区养老家庭照护床位建设管理实施细则》",
            url: "https://zyk.bjhd.gov.cn/zwdt/zcjd/202408/t20240821_4666403.shtml"
          },
          {
            title: "《北京市残疾人居家环境无障碍改造服务管理暂行办法》（京残发〔2020〕15 号）",
            url: "https://www.bdpf.org.cn/cms68/web1459/subject/n1/n1459/n1508/n1509/n1511/n2544/c131951/content.html"
          },
          {
            title: "《北京市老年人能力评估实施办法（试行）》（京民养老发〔2022〕214 号）",
            url: "https://mzj.beijing.gov.cn/art/2022/8/25/art_10688_1398.html"
          }
        ]
      }
    ],

    // 老年人能力评估政策
    assessmentPolicies: [
      {
        id: 4,
        title: "北京市老年人能力评估实施办法",
        file: "pdf4.pdf",
        desc: "老年人能力评估相关实施办法",
        totalPages: 20,
        relatedLinks: [
          {
            title: "北京市老年人能力评估实施办法",
            url: "https://mzj.beijing.gov.cn/art/2022/8/25/art_10688_1398.html"
          }
        ]
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
    batchSize: 5, // 每次加载5页，提升用户体验
    isLoadingMore: false, // 是否正在加载更多页面
    
    // 整体缩放和拖拽状态
    scale: 1, // 整体缩放比例
    translateX: 0, // 整体X偏移
    translateY: 0, // 整体Y偏移
    
    // 触摸相关
    lastTouchX: 0,
    lastTouchY: 0,
    startTouchX: 0,
    startTouchY: 0,
    lastDistance: 0,
    lastScale: 1,
    hasMoved: false, // 是否发生了移动

    showRelatedLinks: false, // 是否显示相关链接
    relatedLinks: [], // 相关链接数据
    displayedRelatedLinks: [], // 实际渲染的链接列表
    relatedLinksExpanded: false, // 是否展开全部链接
    canToggleRelatedLinks: false, // 是否允许展开收起
  },

  onLoad: function (options) {
    console.log('政策法规页面加载完成');
  },

  onShow: function () {
    // 页面显示时的处理
    console.log('政策法规页面显示');
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
    const relatedLinks = e.currentTarget.dataset.relatedLinks || [];

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
        translateX: 0,
        translateY: 0,
        showRelatedLinks: false,
        relatedLinks: [],
        displayedRelatedLinks: [],
        relatedLinksExpanded: false,
        canToggleRelatedLinks: false
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
    const imageList = [];

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
      translateX: 0,
      translateY: 0,
  showRelatedLinks: relatedLinks.length > 0,
  relatedLinks,
  relatedLinksExpanded: false,
  canToggleRelatedLinks: relatedLinks.length > 1
    });

    this.updateRelatedLinksDisplay(relatedLinks, false);

    console.log('PDF图片预览已显示');
  },

  // 更新相关链接的展示列表
  updateRelatedLinksDisplay(links, expanded) {
    const list = Array.isArray(links) ? links : [];
    const canToggle = list.length > 1;
    const shouldExpand = canToggle ? !!expanded : false;
    const displayedLinks = !canToggle || shouldExpand ? list : list.slice(0, 1);

    this.setData({
      displayedRelatedLinks: displayedLinks,
      relatedLinksExpanded: shouldExpand,
      canToggleRelatedLinks: canToggle,
      showRelatedLinks: list.length > 0
    });
  },

  // 切换相关链接展开/收起
  toggleRelatedLinks() {
    const { relatedLinks, relatedLinksExpanded } = this.data;
    const nextExpanded = !relatedLinksExpanded;
    this.updateRelatedLinksDisplay(relatedLinks, nextExpanded);
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

  // 处理滚动到底部，加载更多页面
  handleScrollToLower: function() {
    console.log('滚动到底部，加载更多PDF页面');
    this.loadMoreImages();
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

  // 统一触摸开始处理
  onTouchStart(e) {
    const touches = e.touches;
    
    this.setData({
      hasMoved: false
    });
    
    if (touches.length === 1) {
      // 单指触摸 - 记录初始位置
      const touch = touches[0];
      this.setData({
        startTouchX: touch.clientX,
        startTouchY: touch.clientY,
        lastTouchX: touch.clientX,
        lastTouchY: touch.clientY
      });
    } else if (touches.length === 2) {
      // 双指触摸 - 记录初始距离
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = this.getDistance(touch1, touch2);
      
      this.setData({
        lastDistance: distance,
        lastScale: this.data.scale,
        lastTouchX: (touch1.clientX + touch2.clientX) / 2,
        lastTouchY: (touch1.clientY + touch2.clientY) / 2
      });
    }
  },

  // 统一触摸移动处理
  onTouchMove(e) {
    const touches = e.touches;
    
    if (!this.data.hasMoved) {
      this.setData({ hasMoved: true });
    }
    
    if (touches.length === 1) {
      // 单指拖拽
      const touch = touches[0];
      const deltaX = Math.abs(touch.clientX - this.data.startTouchX);
      const deltaY = Math.abs(touch.clientY - this.data.startTouchY);
      
      // 只有在明显的横向拖拽时才阻止滚动
      if (deltaX > deltaY && deltaX > 10) {
        const moveX = touch.clientX - this.data.lastTouchX;
        const moveY = touch.clientY - this.data.lastTouchY;
        
        // 更新整体偏移
        const screenInfo = wx.getSystemInfoSync();
        const maxTranslateX = screenInfo.windowWidth * this.data.scale * 0.5;
        const maxTranslateY = screenInfo.windowHeight * this.data.scale * 0.5;
        
        let newTranslateX = this.data.translateX + moveX;
        let newTranslateY = this.data.translateY + moveY;
        
        // 限制拖拽范围
        newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
        newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
        
        this.setData({
          translateX: newTranslateX,
          translateY: newTranslateY,
          lastTouchX: touch.clientX,
          lastTouchY: touch.clientY
        });
      } else {
        // 更新拖拽位置但不阻止滚动
        this.setData({
          lastTouchX: touch.clientX,
          lastTouchY: touch.clientY
        });
      }
      
    } else if (touches.length === 2) {
      // 双指缩放 - 阻止滚动
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = this.getDistance(touch1, touch2);
      
      if (this.data.lastDistance && this.data.lastDistance > 0) {
        // 计算缩放比例
        const scaleRatio = distance / this.data.lastDistance;
        let newScale = this.data.lastScale * scaleRatio;
        
        // 限制缩放范围
        newScale = Math.max(1, Math.min(3, newScale));
        
        // 如果缩放到接近1，重置为1并清除偏移
        if (newScale <= 1.05) {
          this.setData({
            scale: 1,
            translateX: 0,
            translateY: 0
          });
        } else {
          this.setData({
            scale: newScale
          });
        }
      }
    }
  },

  // 统一触摸结束处理
  onTouchEnd(e) {
    // 重置触摸状态
    this.setData({
      hasMoved: false,
      lastDistance: 0
    });
  },

  // 统一触摸取消处理
  onTouchCancel(e) {
    this.setData({
      hasMoved: false,
      lastDistance: 0
    });
  },

  // 计算两点距离
  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // 滚动到底部加载更多
  handleScrollToLower() {
    console.log('滚动到底部，当前已加载:', this.data.loadedPages, '总页数:', this.data.currentPdfTotalPages);
    if (this.data.loadedPages < this.data.currentPdfTotalPages && !this.data.isLoadingMore) {
      this.loadMorePages();
    }
  },

  // 加载更多页面
  loadMorePages() {
    const { loadedPages, currentPdfTotalPages, currentImageList } = this.data;
    if (loadedPages >= currentPdfTotalPages) return;

    console.log('开始加载更多页面:', loadedPages + 1, '到', Math.min(loadedPages + this.data.batchSize, currentPdfTotalPages));
    
    this.setData({ isLoadingMore: true });

    // 使用与原始方法相同的URL生成逻辑
    const pdfNum = this.data.currentPdfFile.replace('.pdf', '');
    const baseDir = pdfNum;
    const nextPages = Math.min(this.data.batchSize, currentPdfTotalPages - loadedPages);
    const newPages = [];

    for (let i = 1; i <= nextPages; i++) {
      const pageNum = loadedPages + i;
      const imageUrl = app.getFileUrl(`${baseDir}/${pdfNum}_${pageNum}.jpg`);
      newPages.push({
        url: imageUrl,
        page: pageNum
      });
    }

    console.log('新页面URL:', newPages.map(p => `${p.page}: ${p.url}`));

    this.setData({
      currentImageList: [...currentImageList, ...newPages],
      loadedPages: loadedPages + nextPages,
      isLoadingMore: false
    });
  },

  // 处理图片加载完成
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
          
          console.log(`图片加载完成 [${url}]：原始尺寸 ${width}x${height}，容器尺寸 ${containerWidth}x${containerHeight}`);
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

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 关闭图片查看器
  closeImageViewer() {
    this.setData({
      showImageViewer: false,
      currentImageUrl: '',
      scale: 1,
      translateX: 0,
      translateY: 0
    });
  }
});
