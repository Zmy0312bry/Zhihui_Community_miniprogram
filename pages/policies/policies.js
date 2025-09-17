// pages/policies/policies.js
const app = getApp();

Page({
  data: {
    // 展开状态
    expandedCategories: {
      care: false,
      assessment: false
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

  // 查看PDF文档
  viewPdfImages: function (e) {
    const file = e.currentTarget.dataset.file;
    const title = e.currentTarget.dataset.title;
    const totalPages = e.currentTarget.dataset.pages;
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
    
    console.log('图片预览已显示');
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

  // ===== Scroll View 触摸事件处理 =====
  handleScrollTouchStart: function(e) {
    try {
      if (!e || !e.touches) return;

      const touchCount = e.touches.length;

      // 重置所有状态
      this.resetTouchState();

      if (touchCount === 1) {
        // 单指触摸开始 - 记录起始位置，用于判断是否为滑动
        this.singleTouchStartY = e.touches[0].clientY;
        this.singleTouchStartX = e.touches[0].clientX;
        this.touchStartTime = Date.now();
        this.isSingleTouch = true;

        console.log('Scroll-view 单指触摸开始 - 准备滚动');
      }
      // 双指触摸由 image-zoom-container 处理
    } catch (err) {
      console.error('Scroll触摸开始处理错误:', err);
      this.resetTouchState();
    }
  },

  handleScrollTouchMove: function(e) {
    try {
      if (!e || !e.touches) return;

      const touchCount = e.touches.length;

      if (touchCount === 1) {
        // 单指移动 - 可能是从图片容器传递过来的滑动
        if (this.isSingleTouch && !this.isZooming) {
          // 已经开始的单指触摸，继续处理
          const currentY = e.touches[0].clientY;
          const currentX = e.touches[0].clientX;
          const deltaY = Math.abs(currentY - this.singleTouchStartY);
          const deltaX = Math.abs(currentX - this.singleTouchStartX);

          // 如果移动距离足够大，认为是滑动操作
          if (deltaY > 5 || deltaX > 5) {
            console.log('Scroll-view 单指滑动中 - 页面滚动');
            // 让系统默认处理滚动
            return;
          }
        } else if (!this.isZooming) {
          // 新的单指触摸（可能来自图片容器），开始记录
          this.singleTouchStartY = e.touches[0].clientY;
          this.singleTouchStartX = e.touches[0].clientX;
          this.touchStartTime = Date.now();
          this.isSingleTouch = true;

          console.log('Scroll-view 接收到新的单指触摸');
        }
      } else if (touchCount === 2) {
        // 双指移动 - 传递给缩放处理
        return;
      }
    } catch (err) {
      console.error('Scroll触摸移动处理错误:', err);
    }
  },

  handleScrollTouchEnd: function(e) {
    try {
      if (this.isSingleTouch) {
        // 单指操作结束
        console.log('单指触摸结束');
        this.resetTouchState();
      }
      // 缩放操作结束由 image-zoom-container 处理
    } catch (err) {
      console.error('Scroll触摸结束处理错误:', err);
      this.resetTouchState();
    }
  },

  handleScrollTouchCancel: function(e) {
    try {
      console.log('Scroll触摸操作取消');

      // 重置所有状态
      this.resetTouchState();

      // 恢复滚动状态
      this.setData({
        isScrollEnabled: true,
        isZooming: false
      });
    } catch (err) {
      console.error('Scroll触摸取消处理错误:', err);
      this.resetTouchState();
    }
  },

  // ===== Image Container 触摸事件处理 =====
  handleImageTouchStart: function(e) {
    try {
      if (!e || !e.touches) return;

      const touchCount = e.touches.length;

      // 重置所有状态
      this.resetTouchState();

      if (touchCount === 1) {
        // 单指触摸 - 记录起始位置，用于判断是否为滑动
        this.singleTouchStartY = e.touches[0].clientY;
        this.singleTouchStartX = e.touches[0].clientX;
        this.touchStartTime = Date.now();
        this.isSingleTouch = true;

        console.log('图片上单指触摸开始 - 准备滚动');
      } else if (touchCount === 2) {
        // 双指触摸 - 准备缩放
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        if (!touch1 || !touch2) return;

        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        // 只有距离足够大时才启动缩放
        if (distance >= 30) {
          this.startDistance = distance;
          this.startScale = this.data.scale;
          this.isZooming = true;
          this.isValidZoom = true;

          // 禁用滚动
          this.setData({
            isScrollEnabled: false,
            isZooming: true
          });

          console.log('图片上双指缩放开始');

          // 阻止事件冒泡，防止触发滚动
          e.stopPropagation && e.stopPropagation();
        }
      }
    } catch (err) {
      console.error('图片触摸开始处理错误:', err);
      this.resetTouchState();
    }
  },

  handleImageTouchMove: function(e) {
    try {
      if (!e || !e.touches) return;

      const touchCount = e.touches.length;

      if (touchCount === 1 && this.isSingleTouch && !this.isZooming) {
        // 单指移动 - 检查是否为有效的滑动操作
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const deltaY = Math.abs(currentY - this.singleTouchStartY);
        const deltaX = Math.abs(currentX - this.singleTouchStartX);

        // 如果移动距离足够大，认为是滑动操作
        if (deltaY > 5 || deltaX > 5) {
          // 使用小程序的页面滚动API来手动滚动
          console.log('图片上单指滑动中 - 触发页面滚动');

          // 计算滚动方向和距离
          const scrollDelta = currentY - this.singleTouchStartY;

          // 获取当前页面滚动位置
          const query = wx.createSelectorQuery();
          query.selectViewport().scrollOffset((res) => {
            if (res) {
              // 计算新的滚动位置
              const newScrollTop = Math.max(0, res.scrollTop - scrollDelta);

              // 执行滚动
              wx.pageScrollTo({
                scrollTop: newScrollTop,
                duration: 0 // 无动画，立即滚动
              });
            }
          }).exec();

          // 更新起始位置以实现连续滚动
          this.singleTouchStartY = currentY;
          this.singleTouchStartX = currentX;
        }
      } else if (touchCount === 2 && this.isValidZoom && this.isZooming) {
        // 双指移动 - 处理缩放
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        if (!touch1 || !touch2) return;

        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        // 计算缩放比例
        let newScale = this.startScale * (currentDistance / this.startDistance);

        // 限制缩放范围
        newScale = Math.min(Math.max(newScale, this.data.minScale), this.data.maxScale);

        // 计算百分比显示值
        const scalePercent = Math.round(newScale * 100).toString();

        this.setData({
          scale: newScale,
          scaleDisplay: scalePercent
        });

        // 阻止事件冒泡，防止触发滚动
        e.stopPropagation && e.stopPropagation();
      }
    } catch (err) {
      console.error('图片触摸移动处理错误:', err);
    }
  },

  handleImageTouchEnd: function(e) {
    try {
      if (this.isZooming && this.isValidZoom) {
        // 缩放操作结束
        console.log('图片上缩放操作结束');

        // 立即重置缩放状态
        this.isZooming = false;
        this.isValidZoom = false;

        // 延迟恢复滚动状态，避免误触
        setTimeout(() => {
          this.setData({
            isScrollEnabled: true,
            isZooming: false
          });
          console.log('滚动状态已恢复');
        }, 150);
      } else if (this.isSingleTouch) {
        // 单指操作结束
        console.log('图片上单指触摸结束');
        this.resetTouchState();
      }

      // 阻止事件冒泡
      e.stopPropagation && e.stopPropagation();
    } catch (err) {
      console.error('图片触摸结束处理错误:', err);
      this.resetTouchState();
    }
  },

  handleImageTouchCancel: function(e) {
    try {
      console.log('图片触摸操作取消');

      // 重置所有状态
      this.resetTouchState();

      // 恢复滚动状态
      this.setData({
        isScrollEnabled: true,
        isZooming: false
      });

      // 阻止事件冒泡
      e.stopPropagation && e.stopPropagation();
    } catch (err) {
      console.error('图片触摸取消处理错误:', err);
      this.resetTouchState();
    }
  },

  // ===== Image Zoom Container 触摸事件处理 =====
  handleZoomTouchStart: function(e) {
    try {
      if (!e || !e.touches || e.touches.length !== 2) return;

      // 双指触摸 - 准备缩放
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      if (!touch1 || !touch2) return;

      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // 只有距离足够大时才启动缩放
      if (distance >= 30) {
        this.startDistance = distance;
        this.startScale = this.data.scale;
        this.isZooming = true;
        this.isValidZoom = true;

        // 禁用滚动
        this.setData({
          isScrollEnabled: false,
          isZooming: true
        });

        console.log('双指缩放开始');

        // 阻止事件冒泡，防止触发滚动
        e.stopPropagation && e.stopPropagation();
      }
    } catch (err) {
      console.error('缩放触摸开始处理错误:', err);
      this.resetTouchState();
    }
  },

  handleZoomTouchMove: function(e) {
    try {
      if (!e || !e.touches || e.touches.length !== 2) return;
      if (!this.isValidZoom || !this.isZooming) return;

      // 双指移动 - 处理缩放
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      if (!touch1 || !touch2) return;

      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // 计算缩放比例
      let newScale = this.startScale * (currentDistance / this.startDistance);

      // 限制缩放范围
      newScale = Math.min(Math.max(newScale, this.data.minScale), this.data.maxScale);

      // 计算百分比显示值
      const scalePercent = Math.round(newScale * 100).toString();

      this.setData({
        scale: newScale,
        scaleDisplay: scalePercent
      });

      // 阻止事件冒泡，防止触发滚动
      e.stopPropagation && e.stopPropagation();
    } catch (err) {
      console.error('缩放触摸移动处理错误:', err);
    }
  },

  handleZoomTouchEnd: function(e) {
    try {
      if (this.isZooming && this.isValidZoom) {
        // 缩放操作结束
        console.log('缩放操作结束');

        // 立即重置缩放状态
        this.isZooming = false;
        this.isValidZoom = false;

        // 延迟恢复滚动状态，避免误触
        setTimeout(() => {
          this.setData({
            isScrollEnabled: true,
            isZooming: false
          });
          console.log('滚动状态已恢复');
        }, 150); // 稍微增加延迟时间
      }

      // 阻止事件冒泡
      e.stopPropagation && e.stopPropagation();
    } catch (err) {
      console.error('缩放触摸结束处理错误:', err);
      this.resetTouchState();
    }
  },

  handleZoomTouchCancel: function(e) {
    try {
      console.log('缩放触摸操作取消');

      // 重置所有状态
      this.resetTouchState();

      // 恢复滚动状态
      this.setData({
        isScrollEnabled: true,
        isZooming: false
      });

      // 阻止事件冒泡
      e.stopPropagation && e.stopPropagation();
    } catch (err) {
      console.error('缩放触摸取消处理错误:', err);
      this.resetTouchState();
    }
  },

  // 重置触摸状态
  resetTouchState: function() {
    this.isSingleTouch = false;
    this.isZooming = false;
    this.isValidZoom = false;
    this.singleTouchStartY = 0;
    this.singleTouchStartX = 0;
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
