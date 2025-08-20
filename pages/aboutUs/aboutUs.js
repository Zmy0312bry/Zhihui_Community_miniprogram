Page({
    data: {
        appInfo: {
            name: '智慧社区小程序',
            version: '1.0.0',
            description: '致力于为社区居民提供便民服务和智能化生活体验',
            developer: '智慧社区开发团队',
            contact: 'support@zhihui.com'
        }
    },

    onLoad() {
        console.log('关于我们页面加载');
    },

    // 复制联系方式
    copyContact() {
        wx.setClipboardData({
            data: this.data.appInfo.contact,
            success() {
                wx.showToast({ 
                    title: '联系方式已复制', 
                    icon: 'success' 
                });
            },
            fail(err) {
                console.error('复制失败:', err);
                wx.showToast({ 
                    title: '复制失败', 
                    icon: 'none' 
                });
            },
        });
    },

    // 返回上一页
    goBack() {
        wx.navigateBack();
    }
});
