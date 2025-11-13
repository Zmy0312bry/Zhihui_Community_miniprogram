// pages/elderlyMeals/elderlyMeals.js
const app = getApp();

Page({
    data: {
        // 社区及对应的食谱数据
        communities: [
            {
                id: 0,
                name: '上地街道养老服务中心',
                latitude: 40.030504,
                longitude: 116.302135,
                address: '北京市海淀区裕景西路12号院12号楼',
                menus: [
                    { 
                        id: 'breakfast', 
                        title: '早餐', 
                        image: app.getMediaUrl('zaocan.jpg'), 
                        expanded: false,
                        desc: '营养丰富的早餐，适合早晨就餐'
                    },
                    { 
                        id: 'lunch', 
                        title: '午餐', 
                        image: app.getMediaUrl('wucan11.png'), 
                        expanded: false,
                        desc: '丰盛的午餐，含荤素菜搭配'
                    },
                    { 
                        id: 'dinner', 
                        title: '晚餐', 
                        image: app.getMediaUrl('wancan11.png'), 
                        expanded: false,
                        desc: '清淡易消化的晚餐'
                    }
                ],
                info: [
                    {
                        id: 'location',
                        icon: 'location-o',
                        title: '就餐地点',
                        content: '北京市海淀区裕景西路12号院12号楼',
                        expanded: false
                    },
                    {
                        id: 'time',
                        icon: 'clock-o',
                        title: '营业时间',
                        content: '早上9：00-晚上19：00',
                        expanded: false
                    }
                ]
            },
            {
                id: 1,
                name: '通用芳华上地街道养老照料中心',
                latitude: 40.025922,
                longitude: 116.292592,
                address: '北京市海淀区农大南路厢黄旗万树园小区东门旁上地街道养老照料中心',
                menus: [
                    { 
                        id: 'lunch_2', 
                        title: '午餐', 
                        image: app.getMediaUrl('wucan11.png'), 
                        expanded: false,
                        desc: '丰盛的午餐，含荤素菜搭配'
                    },
                    { 
                        id: 'dinner_2', 
                        title: '晚餐', 
                        image: app.getMediaUrl('wancan11.png'), 
                        expanded: false,
                        desc: '清淡易消化的晚餐'
                    }
                ],
                info: [
                    {
                        id: 'discount',
                        icon: 'coupon-o',
                        title: '优惠信息',
                        content: '长者优惠：28元优惠套餐：15元区荤菜1份+9元区半荤菜1份+7元区素菜1份+主食+汤，60周岁及以上老年人注册政府平台信息后，支付满15元以上减1元，支付满20元以上减2元，支付满30元减3元，支付满50元减5元。建议自带餐盒，外带餐盒：套餐餐盒1元/个，汤碗0.5元/个。',
                        expanded: false
                    },
                    {
                        id: 'time',
                        icon: 'clock-o',
                        title: '就餐时间',
                        content: '周一至周五就餐时间:中餐：11：10-12:10，晚餐：17:00-17:30',
                        expanded: false
                    },
                    {
                        id: 'way',
                        icon: 'orders-o',
                        title: '就餐方式',
                        content: '线下：可堂食、可由机构人员送餐到家；线上：饿了么搜索"社区餐厅（上地店）"即可送餐到家，菜谱每周更新',
                        expanded: false
                    },
                    {
                        id: 'location',
                        icon: 'location-o',
                        title: '就餐地点',
                        content: '就餐地址:北京市海淀区农大南路厢黄旗万树园小区东门旁上地街道养老照料中心',
                        expanded: false
                    }
                ]
            }
        ],
        
        selectedCommunityId: 0,
        currentDate: '2025年9月1号—9月7号',

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
        translateY: 0,
        // 双指缩放相关
        touchMode: null,
        initialPinchDistance: 0,
        initialScale: 1
    },

    // 返回上一页
    goBack: function() {
        wx.navigateBack();
    },

    // 社区选择改变
    onCommunityChange: function(community) {
        this.setData({
            selectedCommunityId: community.id
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

    // 切换菜单展开状态
    toggleMenu: function (e) {
        const communityId = parseInt(e.currentTarget.dataset.communityId);
        const menuId = e.currentTarget.dataset.menuId;
        
        const communities = this.data.communities;
        const communityIndex = communities.findIndex(c => c.id === communityId);
        
        if (communityIndex !== -1) {
            const community = communities[communityIndex];
            const menuIndex = community.menus.findIndex(m => m.id === menuId);
            
            if (menuIndex !== -1) {
                communities[communityIndex].menus[menuIndex].expanded = !communities[communityIndex].menus[menuIndex].expanded;
                this.setData({
                    communities: communities
                });
            }
        }
    },

    // 切换信息卡展开状态
    toggleInfo: function (e) {
        const communityId = parseInt(e.currentTarget.dataset.communityId);
        const infoId = e.currentTarget.dataset.infoId;
        
        const communities = this.data.communities;
        const communityIndex = communities.findIndex(c => c.id === communityId);
        
        if (communityIndex !== -1) {
            const community = communities[communityIndex];
            if (community.info) {
                const infoIndex = community.info.findIndex(i => i.id === infoId);
                if (infoIndex !== -1) {
                    communities[communityIndex].info[infoIndex].expanded = !communities[communityIndex].info[infoIndex].expanded;
                    this.setData({
                        communities: communities
                    });
                }
            }
        }
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
            isDragging: false,
            touchMode: null,
            initialPinchDistance: 0,
            initialScale: 1
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
            isDragging: false,
            touchMode: null,
            initialPinchDistance: 0,
            initialScale: 1
        });
    },

    // 阻止图片区域的点击事件冒泡
    preventClose: function (e) {
        // catchtap 已经自动阻止冒泡，这里不需要再调用 stopPropagation
    },

    // 放大图片
    zoomIn: function () {
        let newScale = this.data.scale + 0.2;
        if (newScale > 8.0) newScale = 8.0;
        this.setData({
            scale: newScale,
            zoomPercent: Math.round(newScale * 100)
        });
    },

    // 缩小图片
    zoomOut: function () {
        let newScale = this.data.scale - 0.2;
        if (newScale < 1.0) newScale = 1.0;
        this.setData({
            scale: newScale,
            zoomPercent: Math.round(newScale * 100)
        });
    },

    // 计算两个触摸点之间的距离
    getDistance: function(touches) {
        if (touches.length < 2) return 0;
        const dx = touches[1].clientX - touches[0].clientX;
        const dy = touches[1].clientY - touches[0].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // 触摸开始
    onTouchStart: function (e) {
        const touches = e.touches;
        
        // 双指缩放
        if (touches.length === 2) {
            this.setData({
                touchMode: 'pinch',
                initialPinchDistance: this.getDistance(touches),
                initialScale: this.data.scale
            });
        } 
        // 单指拖拽
        else if (touches.length === 1 && this.data.scale > 1) {
            const touch = touches[0];
            this.setData({
                touchMode: 'drag',
                isDragging: true,
                dragStartX: touch.clientX - this.data.translateX,
                dragStartY: touch.clientY - this.data.translateY
            });
        }
    },

    // 触摸移动
    onTouchMove: function (e) {
        const touches = e.touches;
        
        // 双指缩放处理
        if (this.data.touchMode === 'pinch' && touches.length === 2) {
            const currentDistance = this.getDistance(touches);
            const initialDistance = this.data.initialPinchDistance;
            
            if (initialDistance > 0) {
                const ratio = currentDistance / initialDistance;
                let newScale = this.data.initialScale * ratio;
                
                // 限制缩放范围：1x 到 8x（100% 到 800%）
                if (newScale < 1) newScale = 1;
                if (newScale > 8) newScale = 8;
                
                this.setData({
                    scale: newScale,
                    zoomPercent: Math.round(newScale * 100)
                });
            }
        } 
        // 单指拖拽处理
        else if (this.data.touchMode === 'drag' && touches.length === 1 && this.data.isDragging) {
            const touch = touches[0];
            const newTranslateX = touch.clientX - this.data.dragStartX;
            const newTranslateY = touch.clientY - this.data.dragStartY;
            
            // 限制拖拽范围
            const maxTranslate = (this.data.scale - 1) * 100;
            const limitedX = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateX));
            const limitedY = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateY));
            
            this.setData({
                translateX: limitedX,
                translateY: limitedY
            });
        }
    },

    // 触摸结束
    onTouchEnd: function (e) {
        this.setData({
            touchMode: null,
            isDragging: false,
            initialPinchDistance: 0,
            initialScale: 1
        });
    },

    // 导航到养老中心位置
    navigateToCommunity: function(e) {
        const index = e.currentTarget.dataset.index;
        const community = this.data.communities[index];
        
        if (!community.latitude || !community.longitude) {
            wx.showToast({
                title: '该养老中心位置信息不可用',
                icon: 'none'
            });
            return;
        }

        wx.openLocation({
            latitude: community.latitude,
            longitude: community.longitude,
            name: community.name,
            address: community.address,
            fail: (err) => {
                console.error('打开地图失败:', err);
                wx.showToast({
                    title: '打开地图失败',
                    icon: 'none'
                });
            }
        });
    },

    onLoad: function(options) {
        // 设置当前日期
        this.setData({
            currentDate: this.getCurrentDate()
        });
    }
});
