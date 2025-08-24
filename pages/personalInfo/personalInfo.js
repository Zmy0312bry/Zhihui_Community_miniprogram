var api = require('./../../utils/api')
var app = getApp();
import Dialog from '@vant/weapp/dialog/dialog';
import Toast from '@vant/weapp/toast/toast';

Page({
    data: {
        userInfo: {},
        avatarUrl: app.getMediaUrl('default.png'),
        nickname: '',
        phone: '',
        isLogin: false,
        editField: '', // 当前正在编辑的字段
        tempInputValue: '', // 临时存储输入值
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
                        avatarUrl: res.data.data.avatar_url || app.getMediaUrl('default.png'),
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

    // 选择头像
    onChooseAvatar(e) {
        const that = this;
        console.log("选择头像", e);
        
        // 微信开放能力返回的头像
        if (e.detail && e.detail.avatarUrl) {
            console.log("微信选择的头像URL:", e.detail.avatarUrl);
            // 微信选择头像后的处理
            that.uploadAvatar(e.detail.avatarUrl);
            return;
        }
        
        // 手动选择头像方式
        Dialog.confirm({
            title: '选择头像',
            message: '请选择头像上传方式',
            confirmButtonText: '从相册选择',
            cancelButtonText: '使用微信头像',
            confirmButtonColor: '#FFC107'
        }).then(() => {
            // 从相册选择
            wx.chooseMedia({
                count: 1,
                mediaType: ['image'],
                sourceType: ['album'],
                camera: 'back',
                success: function(res) {
                    if (res.tempFiles && res.tempFiles.length > 0) {
                        const tempFilePath = res.tempFiles[0].tempFilePath;
                        console.log("选择的本地图片:", tempFilePath);
                        that.uploadAvatar(tempFilePath);
                    } else {
                        Toast.fail('未选择图片');
                    }
                },
                fail: function(err) {
                    console.error('选择图片失败:', err);
                    if (err.errMsg.indexOf('cancel') === -1) {
                        Toast.fail('选择图片失败');
                    }
                }
            });
        }).catch(() => {
            // 使用微信头像
            wx.getUserProfile({
                desc: '用于更新个人头像',
                success: function(res) {
                    const userInfo = res.userInfo;
                    console.log("获取的微信头像:", userInfo.avatarUrl);
                    that.uploadAvatar(userInfo.avatarUrl);
                },
                fail: function(err) {
                    console.error('获取用户信息失败', err);
                    if (err.errMsg.indexOf('cancel') === -1) {
                        Toast.fail('获取微信头像失败');
                    }
                }
            });
        });
    },
    
    // 上传头像，使用PUT方法
    uploadAvatar(filePath) {
        const that = this;
        
        // 如果是微信头像URL而非本地文件路径
        if (filePath.startsWith('http') || filePath.startsWith('https')) {
            // 对于远程URL，需要先下载到本地再上传
            Toast.loading({
                message: '准备头像中...',
                forbidClick: true,
                loadingType: 'spinner',
                duration: 0
            });
            
            // 先下载远程图片
            wx.downloadFile({
                url: filePath,
                success: function(res) {
                    if (res.statusCode === 200) {
                        Toast.clear();
                        // 下载成功后上传本地临时文件
                        that.uploadLocalAvatar(res.tempFilePath);
                    } else {
                        Toast.clear();
                        Toast.fail('获取头像失败');
                        console.error('下载头像失败:', res);
                    }
                },
                fail: function(err) {
                    Toast.clear();
                    Toast.fail('获取头像失败');
                    console.error('下载头像失败:', err);
                }
            });
        } else {
            // 直接上传本地文件
            this.uploadLocalAvatar(filePath);
        }
    },
    
    // 上传本地头像文件
    uploadLocalAvatar(filePath) {
        const that = this;
        
        Toast.loading({
            message: '上传中...',
            forbidClick: true,
            loadingType: 'spinner',
            duration: 0
        });
        
        // 构建上传请求，使用PUT方法
        const uploadConfig = {
            url: api.updateUserInfo_url,
            filePath: filePath,
            name: 'avatar',
            formData: {},
            // method: 'PUT' 已在uploadRequest函数中指定
        };
        
        api.uploadRequest(uploadConfig)
            .then(res => {
                Toast.clear();
                
                if (res.code === 200) {
                    Toast.success('头像修改成功');
                    // 更新本地头像URL
                    that.setData({
                        avatarUrl: res.data.avatar_url || filePath
                    });
                    
                    // 重新获取用户信息以刷新数据
                    setTimeout(() => {
                        that.getUserInfo();
                    }, 500);
                } else {
                    Toast.fail(res.message || '头像修改失败');
                }
            })
            .catch(err => {
                Toast.clear();
                Toast.fail('头像修改失败');
                console.error('上传头像失败:', err);
            });
    },

    // 开始编辑某个字段
    startEdit(e) {
        const field = e.currentTarget.dataset.field;
        let tempValue = '';
        
        // 获取当前字段的值
        switch(field) {
            case 'nickname':
                tempValue = this.data.nickname || '';
                break;
            case 'phone':
                tempValue = this.data.phone || '';
                break;
            case 'real_name':
                tempValue = this.data.userInfo.real_name || '';
                break;
            case 'address':
                tempValue = this.data.userInfo.address || '';
                break;
        }
        
        this.setData({
            editField: field,
            tempInputValue: tempValue
        });
    },
    
    // 处理输入变化
    onInputChange(e) {
        this.setData({
            tempInputValue: e.detail.value
        });
    },
    
    // 修改昵称
    onChooseNickname(e) {
        this.setData({
            nickname: e.detail.value,
            tempInputValue: e.detail.value
        });
        this.saveField({currentTarget: {dataset: {field: 'nickname'}}});
    },
    
    // 保存字段值
    saveField(e) {
        const that = this;
        const field = e.currentTarget.dataset.field;
        const value = this.data.tempInputValue;
        
        // 表单验证
        if (!value && field !== 'address') {
            Toast.fail(`${field === 'nickname' ? '昵称' : field === 'real_name' ? '姓名' : '手机号'}不能为空`);
            return;
        }
        
        // 手机号验证
        if (field === 'phone' && !/^1[3-9]\d{9}$/.test(value)) {
            Toast.fail('请输入有效的手机号');
            return;
        }
        
        Toast.loading({
            message: '保存中...',
            forbidClick: true,
            duration: 0
        });
        
        // 构建表单数据
        const formData = {};
        formData[field] = value;
        
        // 发送更新请求
        const config = {
            url: api.updateUserInfo_url,
            method: 'PUT',
            data: formData,
            contentType: 'application/json'
        };
        
        api.putRequest(config)
            .then(res => {
                Toast.clear();
                
                if (res.code === 200) {
                    Toast.success('修改成功');
                    
                    // 更新本地数据
                    if (field === 'nickname') {
                        that.setData({
                            nickname: value,
                            editField: ''
                        });
                    } else if (field === 'phone') {
                        that.setData({
                            phone: value,
                            editField: ''
                        });
                    } else {
                        // 其他字段需要更新userInfo对象
                        const updatedUserInfo = {...that.data.userInfo};
                        updatedUserInfo[field] = value;
                        
                        that.setData({
                            userInfo: updatedUserInfo,
                            editField: ''
                        });
                    }
                } else {
                    Toast.fail(res.message || '修改失败');
                }
            })
            .catch(err => {
                Toast.clear();
                Toast.fail('保存失败，请重试');
                console.error('保存失败:', err);
            });
    },

    // 取消编辑
    cancelEdit() {
        this.setData({
            editField: '',
            tempInputValue: ''
        });
    },

    // 返回上一页
    goBack() {
        wx.navigateBack();
    }
});
