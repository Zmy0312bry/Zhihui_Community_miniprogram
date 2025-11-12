// pages/contactCommunity/contactCommunity.js

Page({
    data: {
        // 社区列表常量，方便后续修改
        communityList: [
            {
                id: 1,
                name: "上地东里第一社区",
                address: "海淀区上地东里四区7号楼102",
                phone: "62986360",
                latitude: 40.032528,
                longitude: 116.313648
            },
            {
                id: 2,
                name: "上地东里第二社区",
                address: "海淀区上地街道上地东里七区四号楼一层", 
                phone: "62982695",
                latitude: 40.035083,
                longitude: 116.313303
            },
            {
                id: 3,
                name: "上地西里社区",
                address: "上地西里社区颂芳园4号楼611",
                phone: "62963909",
                latitude: 40.035083,
                longitude: 116.313303
            },
            {
                id: 4,
                name: "东馨园社区",
                address: "海淀上地东馨园社区12号楼底商东馨园居委会",
                phone: "82708058",
                latitude: 40.035083,
                longitude: 116.313303
            },
            {
                id: 5,
                name: "马连洼北路一号院社区",
                address: "马连洼北路一号院居委会 在7号楼和9号楼之间",
                phone: "82780367",
                latitude: 40.036433,
                longitude: 116.304886
            },
            {
                id: 6,
                name: "树村社区",
                address: "北京市海淀区树村丽景苑1号楼底商树村社区服务站",
                phone: "82784744",
                latitude: 40.031100,
                longitude: 116.305485
            },
            {
                id: 7,
                name: "紫成嘉园社区",
                address: "海淀区上地街道紫成嘉园9号楼底商A201室",
                phone: "82795004",
                latitude: 40.028335,
                longitude: 116.295227
            },
            {
                id: 8,
                name: "万树园社区",
                address: "北京市海淀区万树园小区29号楼居委会",
                phone: "82796094",
                latitude: 40.026221,
                longitude: 116.290163
            },
            {
                id: 9,
                name: "上地南路社区",
                address: "上地佳园8号楼南侧一层居委会",
                phone: "62969924",
                latitude: 40.031050,
                longitude: 116.319341
            },
            {
                id: 10,
                name: "上地八一社区",
                address: "北京市海淀区信息路33号院",
                phone: "66322219",
                latitude: 40.022783,
                longitude: 116.313323
            },
            {
                id: 11,
                name: "体大颐清园社区",
                address: "圆明园东路48号体大社区居委会",
                phone: "62989466",
                latitude: 40.022783,
                longitude: 116.313323
            },
            {
                id: 12,
                name: "博雅西园社区",
                address: "海淀区农大南路博雅西园南1门博雅西园社区居委会",
                phone: "62966920",
                latitude: 40.024429,
                longitude: 116.294194
            },
            {
                id: 13,
                name: "上地科技园社区",
                address: "西山公馆31号楼底商居委会",
                phone: "82458615",
                latitude: 40.044543,
                longitude: 116.295410
            },
            {
                id: 14,
                name: "清洲社区",
                address: "北京市海淀区清洲社区",
                phone: "010-62989999",
                latitude: 40.021965,
                longitude: 116.302389
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

    // 导航到社区位置
    navigateToCommunity: function(e) {
        const index = e.currentTarget.dataset.index;
        const community = this.data.communityList[index];
        
        if (!community.latitude || !community.longitude) {
            wx.showToast({
                title: '该社区位置信息不可用',
                icon: 'none'
            });
            return;
        }

        wx.openLocation({
            latitude: community.latitude,
            longitude: community.longitude,
            name: community.name,
            address: community.address,
            fail: (err) => {
                console.error('打开地图失败:', err);
                wx.showToast({
                    title: '打开地图失败',
                    icon: 'none'
                });
            }
        });
    },

    onLoad: function(options) {
        
    }
});
