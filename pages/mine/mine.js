import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';


var api = require('./../../utils/api')
var app = getApp()
Page({
    data: {
        scrollTop: 0,
        avatarUrl: '/static/icon/default.png',
        nickname: '',
        isLogin: false,
        phone: '',
        userInfo: {},
        isAuth: true,
        isIphone: false,
        show: false,
        timestamp: Date.now()
    },

    onClickShow() {
        // 重新设置时间戳确保图片刷新
        this.setData({ 
            show: true,
            timestamp: Date.now()
        });
    },

    onClickHide() {
        this.setData({ show: false });
    },

    onClose() {
        this.setData({ show: false });
    },

    // 跳转到个人信息页面
    goToPersonalInfo() {
        wx.navigateTo({
            url: '/pages/personalInfo/personalInfo'
        });
    },

    // 跳转到关于我们页面
    goToAboutUs() {
        wx.navigateTo({
            url: '/pages/aboutUs/aboutUs'
        });
    },

    // 图片加载成功
    onImageLoad(e) {
        console.log('二维码图片加载成功:', e);
        console.log('图片尺寸:', e.detail);
    },

    // 图片加载失败
    onImageError(e) {
        console.error('二维码图片加载失败:', e);
        console.error('错误详情:', e.detail);
        
        // 尝试重新加载图片
        this.setData({
            timestamp: Date.now()
        });
        
        wx.showToast({
            title: '图片加载失败，正在重试...',
            icon: 'none'
        });
    },

    login(e) {
        const that = this;
        wx.getStorage({
            key: 'userLogin',
            success: function (res) {
                wx.request({
                    url: api.wxphone_url,
                    method: 'POST',
                    data: {
                        openid: res.data.openid || '',
                        code: e.detail.code
                    },
                    success: function (res) {
                        that.setData({
                            isLogin: true,
                            isAuth: true
                        })
                        wx.setStorage({
                            key: 'userLogin',
                            data: res.data,
                            success() {
                                that.getuserInfo();
                            }
                        })

                    },
                })
            },
            fail: (res) => {
                wx.showToast({
                    title: '获取token信息失败，请重试',
                    icon: 'none'
                })
                // that.loginAuthState()
            }
        })
    },
    getuserInfo() {
        // userInfo_url
        const that = this
        const config = {
            url: api.userInfo_url,
            method: 'GET',
        }
        api.getRequest(config).then(res => {
            console.log('getuserInfo', res);
            if (res.data) {
                that.setData({
                    userInfo: res.data
                })
                if (res.data.avatar) {
                    that.setData({
                        avatarUrl: res.data.avatar
                    })
                }
                if (res.data.nickname) {
                    that.setData({
                        nickname: res.data.nickname
                    })
                }
            } else {
                that.setData({
                    userInfo: {}
                })
            }
        }).catch(err => {
            console.log('desadxwa', err);
            if (err.code == 500) {
                that.setData({
                    userInfo: {},
                    isLogin: false,
                })
                wx.clearStorage();
            }
        })
    },
    setLogin() {
        const that = this
        that.goLogin((ress) => {
            wx.setStorage({
                key: 'userLogin',
                data: ress.data,
            })
            that.setData({
                isLogin: true
            })

            wx.showToast({title: "登录成功", icon: 'success'});
            that.getuserInfo();
        })
    },
    cancelLogin() {
        const userLogin = wx.getStorageSync('userLogin');
        const loginToken = userLogin.loginToken;
        if(loginToken==null){
            that.setData({
                isLogin: false
            })
            wx.showToast({title: "已退出登录", icon: 'none'});
            return
        }
        const that = this
        const config = {
            url: api.wxlogout_url,
            method: 'POST',
        }
        api.getRequest(config).then(res => {
            wx.removeStorage({
                key: 'userLogin',
                success(res) {
                    console.log('已移除userLogin')
                    that.setData({
                        isLogin: false
                    })
                    wx.showToast({title: "已退出登录", icon: 'none'});
                },
                fail(err) {
                    wx.showToast({title: "退出登录失败", icon: 'none'});
                }
            });
            that.setData({
                userInfo: {}
            })
        })

    },
    goLogin(callback = () => {
    }) {
        const that = this;
        wx.login({
            success: res => {
                console.log('login', res);
                //发送 res.code 到后台换取 openId, sessionKey, unionId
                const config = {
                    url: api.wxlogin_url + '?code=' + res.code,
                    method: 'POST',
                    data: {}
                }
                api.getRequestOpen(config).then(res => {
                    console.log("loginRes", res)
                    if (res.data.loginToken) {
                        that.setData({
                            isAuth: true,
                        })

                        callback(res)

                    } else {
                        that.setData({
                            isAuth: false
                        })
                        wx.setStorage({
                            key: 'userLogin',
                            data: res.data,
                        })
                    }
                })
            },
            fail: (res) => {
                wx.showToast({
                    title: '获取登录凭证code失败！',
                    icon: 'none'
                })
            }
        })
    },
    loginAuthState() {
        const that = this;
        wx.getStorage({
            key: 'userLogin',
            success: function (res) {
                that.getuserInfo();
                that.setData({
                    isLogin: true,
                    isAuth: true
                })
            },
            fail: function () {
                that.setData({
                    isLogin: false
                })
                //that.goLogin();
            },
        })
    },
    onChooseAvatar(e) {
        const that = this
        const avatarUrl = e.detail.avatarUrl
        console.log(avatarUrl)
        const config = {
            url: api.upload_url,
            filePath: avatarUrl
        }
        api.uploadFile(config).then(res => {
            const data = JSON.parse(res)
            const updateInfo = {
                url: api.userUpdate_url,
                method: 'POST',
                data: {
                    "avatar": data.data.url
                }
            }
            api.getRequest(updateInfo)
            that.setData({
                avatarUrl: data.data.url
            })
        })
    },
    onChooseNickname(e) {
        const that = this
        console.log("昵称框触发完成事件", e.detail)
        const value = e.detail.value
        const updateInfo = {
            url: api.userUpdate_url,
            method: 'POST',
            data: {
                "nickname": value
            }
        }
        api.getRequest(updateInfo)
        that.setData({
            nickname: value
        })

    },

    onLoad() {
        // 页面加载时的初始化操作
    },
    onShow() {
        this.getTabBar().init();
        const that = this;
        that.loginAuthState();
    },
})
