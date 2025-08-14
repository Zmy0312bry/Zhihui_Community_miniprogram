//需要认证
let getRequest = (promise) => {
    return new Promise((resolve, reject) => {
        ////多少ms之后显示加载中动画
        let loadingTimer = setTimeout(() => {
            wx.showLoading({
                title: promise.showLoadingTitle || '加载中...',
                mask: true,
            });
        }, promise.showLoadingDelay || 600);
        wx.getStorage({
            key: 'userLogin',
            success: function (res) {
                if (!res.data.loginToken) {
                   toLoginPage()
                    return
                }
                let header = {
                    'Authorization': 'Bearer ' + res.data.loginToken,
                };
                wx.request({
                    url: promise.url,
                    method: promise.method || 'GET',
                    header: header,
                    data: promise.data,
                    success: function (res) {
                        // res
                        console.log('res', res.data);
                        if(res.status === 404) {
                            wx.showToast({
                                title: "接口不存在",
                                icon: 'none'
                            });
                            reject(res.data)
                            return
                        }
                        if (res.data.code === 500) {
                            wx.showToast({
                                title: res.data.msg,
                                icon: 'none'
                            });
                            reject(res.data)
                            return
                        }
                        if (res.data.code === 401) {
                            wx.clearStorage();
                            toLoginPage('身份认证已过期，请重新登录')
                            reject(res.data)
                            return
                        }
                        resolve(res.data)
                    },
                    fail: err => {
                        wx.showToast({title: "网络异常", icon: 'none'});
                        reject(err)
                    },
                })
            },
            fail: err => {
               toLoginPage()

            },
            complete(res) {
                //关闭加载中动画
                wx.hideLoading({});
                clearTimeout(loadingTimer);
            }
        })
    })

}

//不需要认证
let getRequestOpen = (promise) => {
    return new Promise((resolve, reject) => {
        ////多少ms之后显示加载中动画
        let loadingTimer = setTimeout(() => {
            wx.showLoading({
                title: promise.showLoadingTitle || '加载中...',
                mask: true,
            });
        }, promise.showLoadingDelay || 600);
        wx.request({
            url: promise.url,
            method: promise.method || 'GET',
            header: promise.header,
            data: promise.data,
            success: function (res) {
                // res
                console.log('res', res.data);
                if(res.status === 404) {
                    wx.showToast({
                        title: "接口不存在",
                        icon: 'none'
                    });
                    reject(res.data)
                    return
                }
                if (res.data.code === 500) {
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'none'
                    });
                    reject(res.data)
                    return
                }
                resolve(res.data)
            },
            fail: err => {
                wx.showToast({title: "网络异常", icon: 'none'});
                reject(err)
            },
            complete(res) {
                //关闭加载中动画
                wx.hideLoading({});
                clearTimeout(loadingTimer);
            }
        })
    })

}

let uploadFile = (promise) => {
    return new Promise((resolve, reject) => {
        ////多少ms之后显示加载中动画
        let loadingTimer = setTimeout(() => {
            wx.showLoading({
                title: promise.showLoadingTitle || '上传中...',
                mask: true,
            });
        }, promise.showLoadingDelay || 600);
        wx.getStorage({
            key: 'userLogin',
            success: function (res) {
                if (!res.data.loginToken) {
                    toLoginPage();
                    return
                }
                let header = {
                    'Authorization': 'Bearer ' + res.data.loginToken,
                };
                wx.uploadFile({
                    url: promise.url,
                    method: promise.method || 'POST',
                    header: header,
                    filePath: promise.filePath,
                    formData: promise.formData,
                    name: 'file',
                    success: function (res) {
                        // res
                        console.log('res', res.data);
                        if(res.status === 404) {
                            wx.showToast({
                                title: "接口不存在",
                                icon: 'none'
                            });
                            reject(res.data)
                            return
                        }
                        if (res.data.code === 500) {
                            wx.showToast({
                                title: res.data.msg,
                                icon: 'none'
                            });
                            reject(res.data)
                            return
                        }
                        if (res.data.code === 401) {
                            wx.clearStorage();
                            toLoginPage('身份认证已过期，请重新登录')
                            reject(res.data)
                            return
                        }
                        resolve(res.data)

                    },
                    fail: err => {
                        wx.showToast({title: "网络异常", icon: 'none'});
                        reject(err)
                    },
                })
            },
            fail: err => {
               toLoginPage();
            },
            complete(res) {
                //关闭加载中动画
                wx.hideLoading({});
                clearTimeout(loadingTimer);
            }
        })
    })

}

let toLoginPage = function (title){
    wx.showToast({
        title: title || "请先登录",
        icon: 'none',
    });
    setTimeout(() => {
        wx.hideToast();
        wx.reLaunch({
            url: "/pages/mine/mine",
        });
    }, 1500);
}

module.exports = {
    getRequestOpen,
    getRequest,
    uploadFile
}
