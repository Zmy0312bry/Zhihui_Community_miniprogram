// pages/elderlyMeals/elderlyMeals.js

Page({
    data: {
        selectedCommunity: 0,
        communityOptions: [
            { text: '智汇花园社区', value: 0 },
            { text: '阳光家园社区', value: 1 },
            { text: '和谐邻里社区', value: 2 },
            { text: '温馨家园社区', value: 3 },
            { text: '幸福生活社区', value: 4 }
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
                    { id: 1, name: '小笼包', price: '8', image: '/static/img/lunbo.jpg' },
                    { id: 2, name: '豆浆', price: '3', image: '/static/img/lunbo.jpg' },
                    { id: 3, name: '咸菜', price: '2', image: '/static/img/lunbo.jpg' }
                ],
                lunch: [
                    { id: 4, name: '红烧肉', price: '15', image: '/static/img/lunbo.jpg' },
                    { id: 5, name: '青菜豆腐', price: '8', image: '/static/img/lunbo.jpg' },
                    { id: 6, name: '米饭', price: '2', image: '/static/img/lunbo.jpg' }
                ],
                dinner: [
                    { id: 7, name: '蒸蛋羹', price: '6', image: '/static/img/lunbo.jpg' },
                    { id: 8, name: '清炒时蔬', price: '10', image: '/static/img/lunbo.jpg' },
                    { id: 9, name: '小米粥', price: '4', image: '/static/img/lunbo.jpg' }
                ]
            },
            1: { // 阳光家园社区
                breakfast: [
                    { id: 10, name: '煎饺', price: '10', image: '/static/img/lunbo.jpg' },
                    { id: 11, name: '牛奶', price: '5', image: '/static/img/lunbo.jpg' },
                    { id: 12, name: '咸鸭蛋', price: '3', image: '/static/img/lunbo.jpg' }
                ],
                lunch: [
                    { id: 13, name: '糖醋里脊', price: '18', image: '/static/img/lunbo.jpg' },
                    { id: 14, name: '冬瓜汤', price: '6', image: '/static/img/lunbo.jpg' },
                    { id: 15, name: '米饭', price: '2', image: '/static/img/lunbo.jpg' }
                ],
                dinner: [
                    { id: 16, name: '蒸蛋', price: '8', image: '/static/img/lunbo.jpg' },
                    { id: 17, name: '凉拌黄瓜', price: '5', image: '/static/img/lunbo.jpg' },
                    { id: 18, name: '绿豆粥', price: '4', image: '/static/img/lunbo.jpg' }
                ]
            },
            // 其他社区可以类似添加
            2: { // 和谐邻里社区
                breakfast: [
                    { id: 19, name: '包子', price: '6', image: '/static/img/lunbo.jpg' },
                    { id: 20, name: '八宝粥', price: '4', image: '/static/img/lunbo.jpg' }
                ],
                lunch: [
                    { id: 21, name: '宫保鸡丁', price: '16', image: '/static/img/lunbo.jpg' },
                    { id: 22, name: '蛋花汤', price: '5', image: '/static/img/lunbo.jpg' }
                ],
                dinner: [
                    { id: 23, name: '清蒸鱼', price: '20', image: '/static/img/lunbo.jpg' },
                    { id: 24, name: '银耳汤', price: '6', image: '/static/img/lunbo.jpg' }
                ]
            },
            3: { // 温馨家园社区
                breakfast: [
                    { id: 25, name: '油条', price: '3', image: '/static/img/lunbo.jpg' },
                    { id: 26, name: '胡辣汤', price: '5', image: '/static/img/lunbo.jpg' }
                ],
                lunch: [
                    { id: 27, name: '回锅肉', price: '14', image: '/static/img/lunbo.jpg' },
                    { id: 28, name: '紫菜蛋花汤', price: '6', image: '/static/img/lunbo.jpg' }
                ],
                dinner: [
                    { id: 29, name: '白切鸡', price: '18', image: '/static/img/lunbo.jpg' },
                    { id: 30, name: '南瓜粥', price: '4', image: '/static/img/lunbo.jpg' }
                ]
            },
            4: { // 幸福生活社区
                breakfast: [
                    { id: 31, name: '烧饼', price: '4', image: '/static/img/lunbo.jpg' },
                    { id: 32, name: '黑豆浆', price: '4', image: '/static/img/lunbo.jpg' }
                ],
                lunch: [
                    { id: 33, name: '红烧排骨', price: '22', image: '/static/img/lunbo.jpg' },
                    { id: 34, name: '西红柿鸡蛋', price: '8', image: '/static/img/lunbo.jpg' }
                ],
                dinner: [
                    { id: 35, name: '清炒虾仁', price: '25', image: '/static/img/lunbo.jpg' },
                    { id: 36, name: '莲子汤', price: '6', image: '/static/img/lunbo.jpg' }
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
