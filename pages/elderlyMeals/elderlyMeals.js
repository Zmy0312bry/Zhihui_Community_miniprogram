// pages/elderlyMeals/elderlyMeals.js
const app = getApp();

Page({
    data: {
        selectedCommunity: 0,
        communityOptions: [
            { text: '上地西里社区', value: 0 },
            { text: '东馨园社区', value: 1 },
            { text: '上地八一社区', value: 2 },
            { text: '博雅西园社区', value: 3 },
            { text: '上地科技园社区', value: 4 }
        ],
        currentDate: '',
        mealTypes: [
            { type: 'breakfast', name: '早餐' },
            { type: 'lunch', name: '午餐' },
            { type: 'dinner', name: '晚餐' }
        ],
        currentMenus: {},
        // 各社区菜谱数据常量，方便后续修改
        menusData: {
            0: { // 智汇花园社区
                breakfast: [
                    { id: 1, name: '小笼包', price: '8', image: app.getMediaUrl('shipu5.webp') },
                    { id: 2, name: '豆浆', price: '3', image: app.getMediaUrl('shipu1.webp') },
                    { id: 3, name: '咸菜', price: '2', image: app.getMediaUrl('shipu3.webp') }
                ],
                lunch: [
                    { id: 4, name: '红烧肉', price: '15', image: app.getMediaUrl('shipu8.webp') },
                    { id: 5, name: '青菜豆腐', price: '8', image: app.getMediaUrl('shipu6.webp') },
                    { id: 6, name: '米饭', price: '2', image: app.getMediaUrl('shipu4.webp') }
                ],
                dinner: [
                    { id: 7, name: '蒸蛋羹', price: '6', image: app.getMediaUrl('shipu2.webp') },
                    { id: 8, name: '清炒时蔬', price: '10', image: app.getMediaUrl('shipu7.webp') },
                    { id: 9, name: '小米粥', price: '4', image: app.getMediaUrl('shipu9.webp') }
                ]
            },
            1: { // 智汇花园社区
                breakfast: [
                    { id: 1, name: '小笼包', price: '8', image: app.getMediaUrl('shipu5.webp') },
                    { id: 2, name: '豆浆', price: '3', image: app.getMediaUrl('shipu1.webp') },
                    { id: 3, name: '咸菜', price: '2', image: app.getMediaUrl('shipu3.webp') }
                ],
                lunch: [
                    { id: 4, name: '红烧肉', price: '15', image: app.getMediaUrl('shipu8.webp') },
                    { id: 5, name: '青菜豆腐', price: '8', image: app.getMediaUrl('shipu6.webp') },
                    { id: 6, name: '米饭', price: '2', image: app.getMediaUrl('shipu4.webp') }
                ],
                dinner: [
                    { id: 7, name: '蒸蛋羹', price: '6', image: app.getMediaUrl('shipu2.webp') },
                    { id: 8, name: '清炒时蔬', price: '10', image: app.getMediaUrl('shipu7.webp') },
                    { id: 9, name: '小米粥', price: '4', image: app.getMediaUrl('shipu9.webp') }
                ]
            },
            2: { // 智汇花园社区
                breakfast: [
                    { id: 1, name: '小笼包', price: '8', image: app.getMediaUrl('shipu5.webp') },
                    { id: 2, name: '豆浆', price: '3', image: app.getMediaUrl('shipu1.webp') },
                    { id: 3, name: '咸菜', price: '2', image: app.getMediaUrl('shipu3.webp') }
                ],
                lunch: [
                    { id: 4, name: '红烧肉', price: '15', image: app.getMediaUrl('shipu8.webp') },
                    { id: 5, name: '青菜豆腐', price: '8', image: app.getMediaUrl('shipu6.webp') },
                    { id: 6, name: '米饭', price: '2', image: app.getMediaUrl('shipu4.webp') }
                ],
                dinner: [
                    { id: 7, name: '蒸蛋羹', price: '6', image: app.getMediaUrl('shipu2.webp') },
                    { id: 8, name: '清炒时蔬', price: '10', image: app.getMediaUrl('shipu7.webp') },
                    { id: 9, name: '小米粥', price: '4', image: app.getMediaUrl('shipu9.webp') }
                ]
            },
            3: { // 智汇花园社区
                breakfast: [
                    { id: 1, name: '小笼包', price: '8', image: app.getMediaUrl('shipu5.webp') },
                    { id: 2, name: '豆浆', price: '3', image: app.getMediaUrl('shipu1.webp') },
                    { id: 3, name: '咸菜', price: '2', image: app.getMediaUrl('shipu3.webp') }
                ],
                lunch: [
                    { id: 4, name: '红烧肉', price: '15', image: app.getMediaUrl('shipu8.webp') },
                    { id: 5, name: '青菜豆腐', price: '8', image: app.getMediaUrl('shipu6.webp') },
                    { id: 6, name: '米饭', price: '2', image: app.getMediaUrl('shipu4.webp') }
                ],
                dinner: [
                    { id: 7, name: '蒸蛋羹', price: '6', image: app.getMediaUrl('shipu2.webp') },
                    { id: 8, name: '清炒时蔬', price: '10', image: app.getMediaUrl('shipu7.webp') },
                    { id: 9, name: '小米粥', price: '4', image: app.getMediaUrl('shipu9.webp') }
                ]
            },
            4: { // 智汇花园社区
                breakfast: [
                    { id: 1, name: '小笼包', price: '8', image: app.getMediaUrl('shipu5.webp') },
                    { id: 2, name: '豆浆', price: '3', image: app.getMediaUrl('shipu1.webp') },
                    { id: 3, name: '咸菜', price: '2', image: app.getMediaUrl('shipu3.webp') }
                ],
                lunch: [
                    { id: 4, name: '红烧肉', price: '15', image: app.getMediaUrl('shipu8.webp') },
                    { id: 5, name: '青菜豆腐', price: '8', image: app.getMediaUrl('shipu6.webp') },
                    { id: 6, name: '米饭', price: '2', image: app.getMediaUrl('shipu4.webp') }
                ],
                dinner: [
                    { id: 7, name: '蒸蛋羹', price: '6', image: app.getMediaUrl('shipu2.webp') },
                    { id: 8, name: '清炒时蔬', price: '10', image: app.getMediaUrl('shipu7.webp') },
                    { id: 9, name: '小米粥', price: '4', image: app.getMediaUrl('shipu9.webp') }
                ]
            }
        }
    },

    // 返回上一页
    goBack: function() {
        wx.navigateBack();
    },

    // 社区选择改变
    onCommunityChange: function(event) {
        const communityIndex = event.detail;
        this.setData({
            selectedCommunity: communityIndex,
            currentMenus: this.data.menusData[communityIndex] || {}
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

    onLoad: function(options) {
        // 设置当前日期
        this.setData({
            currentDate: this.getCurrentDate(),
            currentMenus: this.data.menusData[0] // 默认显示第一个社区的菜谱
        });
    }
});
