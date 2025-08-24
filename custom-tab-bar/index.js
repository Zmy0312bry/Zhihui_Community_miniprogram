// custom-tab-bar/index.js
const app = getApp();

Component({
    data: {
        app: app, // 添加app对象到data中，方便在WXML中访问
        active: 0,
        list: [
            {
                pagePath: "/pages/index/index",
                text: "首页",
                icon: "wap-home-o",
                imageUrl: "left.png" // 使用app.getMediaUrl可访问的文件名
            },
            {
                pagePath: "/pages/aiChat/aiChat", 
                text: "AI聊天",
                icon: "chat-o",
                imageUrl: "left.png" // 使用app.getMediaUrl可访问的文件名
            },
            {
                pagePath: "/pages/mine/mine",
                text: "我的",
                icon: "user-o",
                imageUrl: "left.png" // 使用app.getMediaUrl可访问的文件名
            },
        ]
    },

    methods: {
        onChange(e) {
            this.setData({ active: e.detail });
            wx.switchTab({
                url: this.data.list[e.detail].pagePath
            });

        },
        init() {
            const page = getCurrentPages().pop();
            this.setData({
                active: this.data.list.findIndex(item => item.pagePath === `/${page.route}`)
            });
        },
    }
})

