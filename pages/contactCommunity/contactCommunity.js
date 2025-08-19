// pages/contactCommunity/contactCommunity.js

Page({
    data: {
        // 社区列表常量，方便后续修改
        communityList: [
            {
                id: 1,
                name: "智汇花园社区",
                address: "XX市XX区XX街道XX号",
                phone: "021-12345678"
            },
            {
                id: 2,
                name: "阳光家园社区",
                address: "XX市XX区XX街道XX号", 
                phone: "021-87654321"
            },
            {
                id: 3,
                name: "和谐邻里社区",
                address: "XX市XX区XX街道XX号",
                phone: "021-11223344"
            },
            {
                id: 4,
                name: "温馨家园社区",
                address: "XX市XX区XX街道XX号",
                phone: "021-55667788"
            },
            {
                id: 5,
                name: "幸福生活社区",
                address: "XX市XX区XX街道XX号",
                phone: "021-99887766"
            }
        ]
    },

    // 返回上一页
    goBack: function() {
        wx.navigateBack();
    },

    // 拨打社区电话
    callCommunity: function(e) {
        const phone = e.currentTarget.dataset.phone;
        wx.showModal({
            title: '拨打电话',
            content: `是否拨打 ${phone}？`,
            success: (res) => {
                if (res.confirm) {
                    wx.makePhoneCall({
                        phoneNumber: phone,
                        fail: (err) => {
                            wx.showToast({
                                title: '拨打失败',
                                icon: 'error'
                            });
                        }
                    });
                }
            }
        });
    },

    onLoad: function(options) {
        
    }
});
