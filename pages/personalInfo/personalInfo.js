var api = require('./../../utils/api')

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
    getUserInfo() {
        const that = this;
        const config = {
            url: api.userInfo_url,
            method: 'GET',
        };

        api.getRequest(config).then(res => {
            console.log('获取用户信息', res);
            if (res.data) {
                that.setData({
                    userInfo: res.data,
                    isLogin: true
                });
                
                if (res.data.avatar) {
                    that.setData({
                        avatarUrl: res.data.avatar
                    });
                }
                
                if (res.data.nickname) {
                    that.setData({
                        nickname: res.data.nickname
                    });
                }
                
                if (res.data.phone) {
                    that.setData({
                        phone: res.data.phone
                    });
                }
            } else {
                that.setData({
                    userInfo: {},
                    isLogin: false
                });
            }
        }).catch(err => {
            console.log('获取用户信息失败', err);
            if (err.code == 500) {
                that.setData({
                    userInfo: {},
                    isLogin: false
                });
                wx.showToast({
                    title: '请先登录',
                    icon: 'none'
                });
                setTimeout(() => {
                    wx.navigateBack();
                }, 1500);
            }
        });
    },

    // 选择头像
    onChooseAvatar(e) {
        const that = this;
        const avatarUrl = e.detail.avatarUrl;
        console.log('选择头像', avatarUrl);
        
        const config = {
            url: api.upload_url,
            filePath: avatarUrl
        };
        
        api.uploadFile(config).then(res => {
            const data = JSON.parse(res);
            const updateInfo = {
                url: api.userUpdate_url,
                method: 'POST',
                data: {
                    "avatar": data.data.url
                }
            };
            
            api.getRequest(updateInfo).then(() => {
                that.setData({
                    avatarUrl: data.data.url
                });
                wx.showToast({
                    title: '头像更新成功',
                    icon: 'success'
                });
            });
        }).catch(err => {
            console.log('头像上传失败', err);
            wx.showToast({
                title: '头像上传失败',
                icon: 'none'
            });
        });
    },

    // 修改昵称
    onChooseNickname(e) {
        const that = this;
        console.log("昵称框触发完成事件", e.detail);
        const value = e.detail.value;
        
        if (!value.trim()) {
            wx.showToast({
                title: '昵称不能为空',
                icon: 'none'
            });
            return;
        }
        
        const updateInfo = {
            url: api.userUpdate_url,
            method: 'POST',
            data: {
                "nickname": value
            }
        };
        
        api.getRequest(updateInfo).then(() => {
            that.setData({
                nickname: value
            });
            wx.showToast({
                title: '昵称更新成功',
                icon: 'success'
            });
        }).catch(err => {
            console.log('昵称更新失败', err);
            wx.showToast({
                title: '昵称更新失败',
                icon: 'none'
            });
        });
    },

    // 返回上一页
    goBack() {
        wx.navigateBack();
    }
});
