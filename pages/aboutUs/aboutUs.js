const app = getApp();

Page({
    data: {
        app: app, // 添加app对象到data中，用于在wxml中访问app.getMediaUrl
        // 预先生成图片URL，不添加时间戳参数
        logoUrl: null,
        timestamp: Date.now(), // 添加时间戳，用于刷新图片缓存
        appInfo: {
            name: '上地小e养老',
            version: '1.0.0',
            description: '小e助手是通过智能化数字人虚拟助手为核心抓手，致力于通过科技手段提升为老服务水平，满足老年人日益增长的智能化生活需求。',
            developer: '北京邮电大学开发团队',
            contact: '	302511800@qq.com'
        }
    },

    onLoad() {
        console.log('关于我们页面加载');
        // 预生成图片URL，不添加查询参数
        const logoUrl = app.getMediaUrl('bupt.png');
        console.log('Logo URL:', logoUrl);
        
        // 更新数据，使用预生成的URL
        this.setData({
            timestamp: Date.now(),
            logoUrl: logoUrl
        });
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
