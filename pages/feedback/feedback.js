Page({
    data: {
        feedbackType: 'suggestion', // suggestion, bug, other
        feedbackContent: '',
        contactInfo: '',
        isSubmitting: false
    },

    // 选择反馈类型
    onFeedbackTypeChange(e) {
        this.setData({
            feedbackType: e.detail
        });
    },

    // 反馈内容输入
    onContentInput(e) {
        this.setData({
            feedbackContent: e.detail || ''
        });
    },

    // 联系方式输入
    onContactInput(e) {
        this.setData({
            contactInfo: e.detail || ''
        });
    },

    // 提交反馈
    submitFeedback() {
        const { feedbackContent, feedbackType, contactInfo } = this.data;

        // 检查反馈内容是否为空
        if (!feedbackContent.trim()) {
            wx.showToast({
                title: '请填写反馈内容',
                icon: 'none'
            });
            return;
        }

        this.setData({
            isSubmitting: true
        });

        // 构建反馈类型映射
        const feedbackTypeMap = {
            'suggestion': '建议',
            'bug': '问题',
            'other': '其他'
        };

        // 构建请求数据
        const requestData = {
            feedback_type: feedbackTypeMap[feedbackType] || '其他',
            content: feedbackContent.trim(),
            contact_info: contactInfo.trim() || null
        };

        // 发送POST请求
        wx.request({
            url: 'https://shangdi.bjseeyoung.com/user/feedback/',
            method: 'POST',
            data: requestData,
            header: {
                'Content-Type': 'application/json'
            },
            success: (res) => {
                console.log('反馈提交成功:', res);
                
                // 清空表单内容
                this.setData({
                    feedbackContent: '',
                    contactInfo: '',
                    isSubmitting: false
                });

                // 显示成功提示
                wx.showToast({
                    title: '反馈提交成功',
                    icon: 'success',
                    duration: 2000
                });

                // 延迟返回上一页
                setTimeout(() => {
                    wx.navigateBack();
                }, 2000);
            },
            fail: (err) => {
                console.error('反馈提交失败:', err);
                
                this.setData({
                    isSubmitting: false
                });

                wx.showToast({
                    title: '提交失败，请重试',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    },

    onLoad() {
        // 页面加载时的初始化
    }
})
