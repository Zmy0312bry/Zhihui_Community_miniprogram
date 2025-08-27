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
            feedbackContent: e.detail.value
        });
    },

    // 联系方式输入
    onContactInput(e) {
        this.setData({
            contactInfo: e.detail.value
        });
    },

    // 提交反馈
    submitFeedback() {
        const { feedbackContent, feedbackType, contactInfo } = this.data;

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

        // 这里可以添加实际的提交逻辑，比如调用API
        setTimeout(() => {
            wx.showToast({
                title: '反馈提交成功',
                icon: 'success'
            });

            this.setData({
                isSubmitting: false,
                feedbackContent: '',
                contactInfo: ''
            });

            // 延迟返回上一页
            setTimeout(() => {
                wx.navigateBack();
            }, 1500);
        }, 1000);
    },

    onLoad() {
        // 页面加载时的初始化
    }
})
