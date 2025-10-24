// pages/resourceMap/resourceMap.js
Page({
  data: {
    serviceCenters: [
      {
        name: "嘉和一品粥（上地店）",
        address: "海淀区信息路19号（超市发旁边，上地南口）",
        manager: "张海花",
        phone: "17746533264",
        phone2: null,
        latitude: 40.0635,
        longitude: 116.3185
      },
      {
        name: "上地街道养老服务中心",
        address: "北京市海淀区裕景西路 12 号院12 号楼",
        manager: "刘庆涛",
        phone: "13241086095",
        phone2: "82721989",
        latitude: 40.0672,
        longitude: 116.3108
      },
      {
        name: "通用康养风华北京上地街道养老照料中心",
        address: "北京市海淀区农大南路厢黄旗万树园27号楼",
        manager: "张朝侠",
        phone: "13466555356",
        phone2: null,
        latitude: 40.0598,
        longitude: 116.3246
      },
      {
        name: "上地南路社区养老服务驿站",
        address: "上地佳园1号楼底商",
        manager: "李赞颖",
        phone: "18610629965",
        phone2: null,
        latitude: 40.0651,
        longitude: 116.3195
      },
      {
        name: "树村社区养老服务驿站",
        address: "树村丽景苑社区3号楼一层东3室",
        manager: "李殷祺",
        phone: "18614026617",
        phone2: null,
        latitude: 40.0594,
        longitude: 116.3265
      },
      {
        name: "东馨园社区养老服务驿站",
        address: "东馨园12号楼底商",
        manager: "蒋妍",
        phone: "18610629965",
        phone2: null,
        latitude: 40.0624,
        longitude: 116.3042
      }
    ]
  },

  onLoad: function (options) {
    // 页面加载时执行的函数
  },

  onReady: function () {
    // 页面初次渲染完成时执行
  },

  onShow: function () {
    // 页面显示时执行
  },

  // 立即拨打弹出选择框
  callPhoneChoice: function (e) {
    const index = e.currentTarget.dataset.index;
    const center = this.data.serviceCenters[index];
    if (!center) return;
    if (center.phone2) {
      wx.showActionSheet({
        itemList: [
          `拨打手机：${center.phone}`,
          `拨打座机：${center.phone2}`
        ],
        success: (res) => {
          if (res.tapIndex === 0) {
            wx.makePhoneCall({
              phoneNumber: center.phone
            });
          } else if (res.tapIndex === 1) {
            wx.makePhoneCall({
              phoneNumber: center.phone2
            });
          }
        }
      });
    } else {
      wx.makePhoneCall({
        phoneNumber: center.phone
      });
    }
  },

  // 导航到位置
  showLocation: function (e) {
    const index = e.currentTarget.dataset.index;
    const center = this.data.serviceCenters[index];
    
    if (!center || center.latitude === undefined || center.longitude === undefined) {
      wx.showToast({
        title: '位置信息不可用',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '导航',
      content: `是否前往 ${center.name} 进行导航?\n地址: ${center.address}`,
      confirmText: '确定导航',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.openLocation({
            latitude: center.latitude,
            longitude: center.longitude,
            name: center.name,
            address: center.address,
            fail: function() {
              wx.showToast({
                title: '打开地图失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  }
})