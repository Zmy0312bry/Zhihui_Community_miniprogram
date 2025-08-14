// custom-tab-bar/index.js
Component({
    data: {
        active: 0,
        list: [
            {
                pagePath: "/pages/index/index",
                text: "首页",
                icon: "home-o",
            },
            {
                pagePath: "/pages/aiChat/aiChat",
                text: "聊天",
                icon: "chat-o",
            },
            {
                pagePath: "/pages/mine/mine",
                text: "我的",
                icon:"user-o",

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

