// pages/contactCommunity/contactCommunity.js

Page({
    data: {
        // 社区列表常量，方便后续修改
        communityList: [
            {
                id: 1,
                name: "上地东里第一社区",
                address: "上地东里四区7号楼102",
                phone: "62986360"
            },
            {
                id: 2,
                name: "上地东里第二社区",
                address: "七区4号楼一层", 
                phone: "62982695"
            },
            {
                id: 3,
                name: "上地西里社区",
                address: "上地西里社区颂芳园4号楼611",
                phone: "62963909"
            },
            {
                id: 4,
                name: "东馨园社区",
                address: "海淀上地东馨园社区12号楼底商东馨园居委会",
                phone: "82708058"
            },
            {
                id: 5,
                name: "马连洼北路一号院社区",
                address: "海淀区马连洼北路1号院社区居委会7号楼后侧平房",
                phone: "82780367"
            },
            {
                id: 6,
                name: "树村社区",
                address: "树村丽景苑1号楼底商",
                phone: "82784744"
            },
            {
                id: 7,
                name: "紫成嘉园社区",
                address: "海淀区上地街道紫成嘉园9号楼底商A201室",
                phone: "82795004"
            },
            {
                id: 8,
                name: "万树园社区",
                address: "万树园社区29号楼",
                phone: "82796094"
            },
            {
                id: 9,
                name: "上地南路社区",
                address: "上地佳园8号楼1层",
                phone: "62969924"
            },
            {
                id: 10,
                name: "上地八一社区",
                address: "信息路33号",
                phone: "66322219"
            },
            {
                id: 11,
                name: "体大颐清园社区",
                address: "圆明园东路48号体大社区居委会",
                phone: "62989466"
            },
            {
                id: 12,
                name: "博雅西园社区",
                address: "农大南路博雅西园南1门底商",
                phone: "62966920"
            },
            {
                id: 13,
                name: "上地科技园社区",
                address: "西山公馆31号楼底商",
                phone: "82458615"
            },
            {
                id: 14,
                name: "清洲社区(筹备组)",
                address: "正白旗西路3号院",
                phone: "150 1018 7708"
            }
        ]
    },

    // 返回上一页
    goBack: function() {
        wx.navigateBack();
    },

    // 拨打社区电话 - 直接拨打，无提示框
    callCommunity: function(e) {
        const phone = e.currentTarget.dataset.phone;
        if (phone) {
            wx.makePhoneCall({
                phoneNumber: phone,
                fail: function() {
                    wx.showToast({
                        title: '拨打电话失败',
                        icon: 'none'
                    });
                }
            });
        }
    },

    onLoad: function(options) {
        
    }
});
