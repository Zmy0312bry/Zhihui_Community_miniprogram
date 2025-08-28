// pages/healthCenter/healthCenter.js
Page({
  data: {
    healthCenters: [
      {
        name: "上地社区卫生服务站",
        address: "北京市海淀区上地南路6号院1楼",
        services: "中医、按摩、拔罐、针灸、全科、西药、中草药、护理",
        phone: "62986449",
        hours: "周一至周五 8:00-11:30,13:30-17:00(法定节假日休息)"
      },
      {
        name: "柳浪家园社区卫生服务站",
        address: "柳浪家园北里12号楼底商",
        services: "中医、按摩、拔罐、针灸、全科、B超、西药、中草药、护理",
        phone: "62981939",
        hours: "周一至周五 8:00-11:30,13:30-17:00；周六 8:00-11:30(法定节假日休息)"
      },
      {
        name: "丽景苑社区卫生服务站",
        address: "树村丽景苑1号楼底商",
        services: "全科、中医、按摩、针灸、艾灸、耳穴、皮内针、拔罐、西药、中草药、护理",
        phone: "62960196",
        hours: "周一至周五8:00-11:30,13:30-17:00(法定节假日休息)"
      },
      {
        name: "东馨园社区卫生服务站",
        address: "东馨园西南2门旁",
        services: "中医、全科、推拿、针灸、理疗、草药、护理",
        phone: "82708055",
        hours: "周一至周五8:00-11:30,13:30-17:00(法定节假日休息)"
      },
      {
        name: "原上地社区卫生服务中心保安室",
        address: "上地西路52号",
        services: "全科、西药、护理、检验",
        phone: "62963395",
        hours: "周一至周五8:00-11:30,13:30-17:00(法定节假日休息)"
      },
      {
        name: "中心预防保健科",
        address: "厢黄旗东路柳浪家园北里11号楼A4室",
        services: "计划免疫、儿童保健、围产保健、传染病防控、严重精神障碍管理、司机体检",
        phone: "62982769",
        hours: "周一至周五8:00-11:30,13:30-17:00(法定节假日休息)"
      }
    ]
  },

  onLoad: function (options) {
  },

  onShow: function () {
  },

  // 拨打电话
  callPhone: function (e) {
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

  // 显示位置信息
  showLocation: function (e) {
    const address = e.currentTarget.dataset.address;
    wx.showModal({
      title: '服务地址',
      content: address,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#FF6B35'
    });
  }
});
