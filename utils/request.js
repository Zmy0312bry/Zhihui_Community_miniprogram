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
        
        // 首先检查内存中是否有token
        let app = getApp();
        let token = app.globalData.token;
        
        if (token) {
            // 直接使用内存中的token
            let header = {
                'Authorization': 'Bearer ' + token,
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
                        app.globalData.token = null; // 清除内存中的token
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
                complete(res) {
                    //关闭加载中动画
                    wx.hideLoading({});
                    clearTimeout(loadingTimer);
                }
            });
            return;
        }
        
        // 从本地存储获取token
        wx.getStorage({
            key: 'userLogin',
            success: function (res) {
                if (!res.data.loginToken) {
                   toLoginPage()
                    return
                }
                // 将token保存到内存中，便于下次使用
                app.globalData.token = res.data.loginToken;
                
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
                            app.globalData.token = null; // 清除内存中的token
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

// 上传文件请求，需要认证
let uploadRequest = (promise) => {
    return new Promise((resolve, reject) => {
        // 显示加载中动画
        let loadingTimer = setTimeout(() => {
            wx.showLoading({
                title: promise.showLoadingTitle || '上传中...',
                mask: true,
            });
        }, promise.showLoadingDelay || 300);
        
        // 获取token
        let app = getApp();
        let token = app.globalData.token;
        
        if (!token) {
            wx.hideLoading();
            clearTimeout(loadingTimer);
            toLoginPage();
            reject(new Error('未登录'));
            return;
        }
        
        // 上传文件，使用PUT方法
        wx.uploadFile({
            url: promise.url,
            filePath: promise.filePath,
            name: promise.name || 'file',
            formData: promise.formData || {},
            method: 'PUT', // 指定使用PUT方法
            header: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'multipart/form-data',
                ...promise.header
            },
            success: function(res) {
                // 上传成功后解析返回数据
                let data = {};
                try {
                    if (typeof res.data === 'string') {
                        data = JSON.parse(res.data);
                    } else {
                        data = res.data;
                    }
                } catch (error) {
                    console.error('解析上传响应数据失败', error);
                    reject(error);
                    return;
                }
                
                if (data.code === 401) {
                    wx.clearStorage();
                    app.globalData.token = null;
                    toLoginPage('身份认证已过期，请重新登录');
                    reject(data);
                    return;
                }
                
                if (data.code === 200) {
                    resolve(data);
                } else {
                    wx.showToast({
                        title: data.msg || '上传失败',
                        icon: 'none'
                    });
                    reject(data);
                }
            },
            fail: function(err) {
                wx.showToast({title: "网络异常", icon: 'none'});
                reject(err);
            },
            complete: function() {
                wx.hideLoading();
                clearTimeout(loadingTimer);
            }
        });
    });
};

// PUT请求，需要认证
let putRequest = (promise) => {
    return new Promise((resolve, reject) => {
        // 显示加载中动画
        let loadingTimer = setTimeout(() => {
            wx.showLoading({
                title: promise.showLoadingTitle || '提交中...',
                mask: true,
            });
        }, promise.showLoadingDelay || 600);
        
        // 获取token
        let app = getApp();
        let token = app.globalData.token;
        
        if (!token) {
            wx.hideLoading();
            clearTimeout(loadingTimer);
            toLoginPage();
            reject(new Error('未登录'));
            return;
        }
        
        // 发起PUT请求
        wx.request({
            url: promise.url,
            method: 'PUT',
            data: promise.data,
            header: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': promise.contentType || 'application/json',
                ...promise.header
            },
            success: function(res) {
                console.log('PUT请求响应:', res.data);
                
                if (res.status === 404) {
                    wx.showToast({title: "接口不存在", icon: 'none'});
                    reject(res.data);
                    return;
                }
                
                if (res.data.code === 500) {
                    wx.showToast({title: res.data.msg, icon: 'none'});
                    reject(res.data);
                    return;
                }
                
                if (res.data.code === 401) {
                    wx.clearStorage();
                    app.globalData.token = null;
                    toLoginPage('身份认证已过期，请重新登录');
                    reject(res.data);
                    return;
                }
                
                resolve(res.data);
            },
            fail: function(err) {
                wx.showToast({title: "网络异常", icon: 'none'});
                reject(err);
            },
            complete: function() {
                wx.hideLoading();
                clearTimeout(loadingTimer);
            }
        });
    });
};

module.exports = {
    getRequestOpen,
    getRequest,
    uploadRequest,
    putRequest
}
