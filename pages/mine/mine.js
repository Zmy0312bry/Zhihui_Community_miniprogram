import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';


var api = require('./../../utils/api')
var app = getApp()
Page({
    data: {
        backgroundColor: '',
        currentTheme: '',
        scrollTop: 0,
        avatarUrl: '/static/icon/default.png',
        nickname: '',
        isLogin: false,
        phone: '',
        userInfo: {},
        isAuth: true,
        isIphone: false,
        show: false,
        giteeUrl:'https://gitee.com/yuanhan93/ai-chat-open',
        showThemeList: false,
        themeList:[],
        rewardedVideoAd: null
    },

    // 初始化激励广告
    initRewardedVideoAd() {
        if (wx.createRewardedVideoAd) {
            this.data.rewardedVideoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-0a691ba51eff0c7d' // 这里替换为实际的广告位ID
            });

            // 监听广告关闭事件
            this.data.rewardedVideoAd.onClose(res => {
                // 用户点击了【关闭广告】按钮
                if (res && res.isEnded) {
                    // 正常播放结束，可以下发奖励
                    this.addChatTimes();
                } else {
                    // 播放中途退出，不下发奖励
                    wx.showToast({
                        title: '观看完整视频才能获得奖励哦',
                        icon: 'none'
                    });
                }
            });

            // 监听广告加载事件
            this.data.rewardedVideoAd.onLoad(() => {
                console.log('激励视频广告加载成功');
            });

            // 监听广告错误事件
            this.data.rewardedVideoAd.onError(err => {
                console.log('激励视频广告出错：', err);
                wx.showToast({
                    title: '广告加载失败，请稍后再试',
                    icon: 'none'
                });
            });
        }
    },

    // 观看广告按钮点击事件
    watchVideoAd() {
        const that = this;

        if (!that.data.isLogin) {
            wx.showToast({
                title: '请先登录',
                icon: 'none'
            });
            return;
        }

        if (that.data.rewardedVideoAd) {
            that.data.rewardedVideoAd.show().catch(() => {
                // 失败重试
                that.data.rewardedVideoAd.load()
                    .then(() => that.data.rewardedVideoAd.show())
                    .catch(err => {
                        console.log('激励视频广告显示失败：', err);
                        wx.showToast({
                            title: '广告加载失败，请稍后再试',
                            icon: 'none'
                        });
                    });
            });
        } else {
            wx.showToast({
                title: '广告组件未初始化',
                icon: 'none'
            });
        }
    },

    // 增加聊天次数
    addChatTimes() {
        const that = this;
        const config = {
            url: api.addChatNums_url,
            method: 'POST',
            data: {
                changeType: 5 //变更类型
            }
        };

        api.getRequest(config).then(res => {
            if (res.code === 200) {
                wx.showToast({
                    title: '恭喜获得15次聊天机会！',
                    icon: 'success'
                });
                // 更新用户信息
                that.getuserInfo();
            } else {
                wx.showToast({
                    title: res.msg || '奖励发放失败，请稍后再试',
                    icon: 'none'
                });
            }
        }).catch(err => {
            console.log('奖励发放失败', err);
            wx.showToast({
                title: '奖励发放失败，请稍后再试',
                icon: 'none'
            });
        });
    },

    copyGiteeContent(){
        wx.setClipboardData({
            data: this.data.giteeUrl,
            success() {
                wx.showToast({ title: '复制成功', icon: 'success' });
            },
            fail(err) {
                console.error('Failed to copy:', err);
                wx.showToast({ title: '复制失败', icon: 'none' });
            },
        });
    },

    onClickShow() {
        this.setData({ show: true });
    },

    onClickHide() {
        this.setData({ show: false });
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
        const {loginToken} = wx.getStorageSync('userLogin');
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
        const {avatarUrl} = e.detail
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

    changeTheme: function (e) {
        const theme = e.currentTarget.dataset.theme;
        this.setData({
            currentTheme: theme
        });
        app.updateTheme(theme);
    },

    openThemeList: function (){
        const that = this;
        that.setData({
            showThemeList: true
        })
    },

    onLoad() {
        this.setData({
            backgroundColor: app.globalData.backgroundColor,
            themeList: app.globalData.themeList,
            currentTheme: app.globalData.theme
        });
        const cachedTheme = wx.getStorageSync('currentTheme');
        if (cachedTheme) {
            app.onThemeChange(cachedTheme);
        }

        // 初始化激励广告
        this.initRewardedVideoAd();
    },
    onShow() {
        this.getTabBar().init();
        const that = this;
        that.loginAuthState();
    },
})
