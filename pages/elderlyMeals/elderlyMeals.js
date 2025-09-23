// pages/elderlyMeals/elderlyMeals.js
const app = getApp();

Page({
    data: {
        selectedCommunity: 0,
        communityOptions: [
            { text: '上地街道养老服务中心', value: 0 },
            { text: '通用芳华上地街道养老照料中心', value: 1 }
        ],
        currentDate: '2025年9月1号—9月7号',

        // 展开状态
        expandedCategories: {
            breakfast: false,
            lunch: false,
            dinner: false
        },

        // 食谱图片数据
        menus: {
            breakfast: { image: app.getMediaUrl('zaocan.jpg'), name: '早餐' },
            lunch: { image: app.getMediaUrl('wucan11.png'), name: '午餐' },
            dinner: { image: app.getMediaUrl('wancan11.png'), name: '晚餐' }
        },

        // 图片预览相关
        showImageViewer: false,
        currentImage: '',
        currentImageTitle: '',
        scale: 1,
        zoomPercent: 100, // 缩放百分比
        // 拖拽相关
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        translateX: 0,
        translateY: 0
    },

    // 返回上一页
    goBack: function() {
        wx.navigateBack();
    },

    // 社区选择改变
    onCommunityChange: function(event) {
        const communityIndex = event.detail;
        this.setData({
            selectedCommunity: communityIndex
        });
    },

    // 获取当前日期
    getCurrentDate: function() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}年${month}月${day}日`;
    },

    // 切换分类展开状态
    toggleCategory: function (e) {
        const category = e.currentTarget.dataset.category;
        const expandedCategories = this.data.expandedCategories;

        this.setData({
            [`expandedCategories.${category}`]: !expandedCategories[category]
        });
    },

    // 查看图片
    viewImage: function (e) {
        const image = e.currentTarget.dataset.image;
        const title = e.currentTarget.dataset.title;

        this.setData({
            showImageViewer: true,
            currentImage: image,
            currentImageTitle: title,
            scale: 1,
            zoomPercent: 100,
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

    // 阻止图片区域的点击事件冒泡
    preventClose: function (e) {
        e.stopPropagation();
    },

    // 放大图片
    zoomIn: function () {
        let newScale = this.data.scale + 0.2;
        if (newScale > 3.0) newScale = 3.0;
        this.setData({
            scale: newScale,
            zoomPercent: Math.round(newScale * 100)
        });
    },

    // 缩小图片
    zoomOut: function () {
        let newScale = this.data.scale - 0.2;
        if (newScale < 0.5) newScale = 0.5;
        this.setData({
            scale: newScale,
            zoomPercent: Math.round(newScale * 100)
        });
    },

    // 触摸开始
    onTouchStart: function (e) {
        if (this.data.scale <= 1) return; // 只有放大时才允许拖拽
        
        const touch = e.touches[0];
        this.setData({
            isDragging: true,
            dragStartX: touch.clientX - this.data.translateX,
            dragStartY: touch.clientY - this.data.translateY
        });
    },

    // 触摸移动
    onTouchMove: function (e) {
        if (!this.data.isDragging || this.data.scale <= 1) return;
        
        const touch = e.touches[0];
        const newTranslateX = touch.clientX - this.data.dragStartX;
        const newTranslateY = touch.clientY - this.data.dragStartY;
        
        // 限制拖拽范围
        const maxTranslate = (this.data.scale - 1) * 100; // 根据缩放比例计算最大拖拽距离
        const limitedX = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateX));
        const limitedY = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateY));
        
        this.setData({
            translateX: limitedX,
            translateY: limitedY
        });
    },

    // 触摸结束
    onTouchEnd: function (e) {
        this.setData({
            isDragging: false
        });
    },

    onLoad: function(options) {
        // 设置当前日期
        this.setData({
            currentDate: this.getCurrentDate()
        });
    }
});
