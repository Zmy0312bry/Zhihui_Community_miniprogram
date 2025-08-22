var api = require('./../../utils/api')
var app = getApp();

Page({
    data: {
        userInfo: {},
        avatarUrl: '/static/icon/default.png',
        nickname: '',
        phone: '',
        isLogin: false
    },

    onLoad() {
        this.getUserInfo();
    },

    onShow() {
        this.getUserInfo();
    },

    // 获取用户信息
    // 格式化日期为"某年某月某日"
    formatDate(dateString) {
        if (!dateString) return '未知';
        const date = new Date(dateString);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
    
    getUserInfo() {
        const that = this;
        
        // 确保使用内存中的token
        if (!app.globalData.token) {
            console.error("获取用户资料失败: 无可用token");
            wx.showToast({
                title: '请先登录',
                icon: 'none'
            });
            setTimeout(() => {
                wx.navigateBack();
            }, 1500);
            return;
        }
        
        wx.request({
            url: api.userInfo_url,
            method: 'GET',
            header: {
                'Authorization': 'Bearer ' + app.globalData.token
            },
            success: function(res) {
                console.log('获取用户信息', res.data);
                if (res.data && res.data.code === 200 && res.data.data) {
                    // 格式化创建时间
                    const formattedDate = that.formatDate(res.data.data.created_at);
                    
                    const updatedUserInfo = {
                        ...res.data.data,
                        formattedCreatedAt: formattedDate
                    };
                    
                    that.setData({
                        userInfo: updatedUserInfo,
                        isLogin: true,
                        avatarUrl: res.data.data.avatar_url || '/static/icon/default.png',
                        nickname: res.data.data.nickname || '',
                        phone: res.data.data.phone || ''
                    });
                } else {
                    that.setData({
                        userInfo: {},
                        isLogin: false
                    });
                    wx.showToast({
                        title: '获取用户信息失败',
                        icon: 'none'
                    });
                }
            },
            fail: function(err) {
                console.error('获取用户信息失败', err);
                that.setData({
                    userInfo: {},
                    isLogin: false
                });
                wx.showToast({
                    title: '网络请求失败',
                    icon: 'none'
                });
            }
        });
    },

    // 选择头像 - 不再支持上传功能
    onChooseAvatar(e) {
        const that = this;
        wx.showToast({
            title: '功能暂不可用',
            icon: 'none'
        });
    },

    // 修改昵称 - 不再支持更新功能
    onChooseNickname(e) {
        const that = this;
        wx.showToast({
            title: '功能暂不可用',
            icon: 'none'
        });
    },

    // 返回上一页
    goBack() {
        wx.navigateBack();
    }
});
