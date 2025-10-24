// pages/healthCenter/healthCenter.js
Page({
  data: {
    healthCenters: [
      {
        name: "上地社区卫生服务站",
        address: "北京市海淀区上地南路6号院1楼",
        latitude: 40.0641,
        longitude: 116.3190,
        services: "中医、按摩、拔罐、针灸、全科、西药、中草药、护理",
        phone: "62986449",
        hours: "周一至周五 8:00-11:30,13:30-17:00(法定节假日休息)"
      },
      {
        name: "柳浪家园社区卫生服务站",
        address: "柳浪家园北里12号楼底商",
        latitude: 40.0689,
        longitude: 116.3117,
        services: "中医、按摩、拔罐、针灸、全科、B超、西药、中草药、护理",
        phone: "62981939",
        hours: "周一至周五 8:00-11:30,13:30-17:00；周六 8:00-11:30(法定节假日休息)"
      },
      {
        name: "丽景苑社区卫生服务站",
        address: "树村丽景苑1号楼底商",
        latitude: 40.0594,
        longitude: 116.3265,
        services: "全科、中医、按摩、针灸、艾灸、耳穴、皮内针、拔罐、西药、中草药、护理",
        phone: "62960196",
        hours: "周一至周五8:00-11:30,13:30-17:00(法定节假日休息)"
      },
      {
        name: "东馨园社区卫生服务站",
        address: "东馨园西南2门旁",
        latitude: 40.0624,
        longitude: 116.3042,
        services: "中医、全科、推拿、针灸、理疗、草药、护理",
        phone: "82708055",
        hours: "周一至周五8:00-11:30,13:30-17:00(法定节假日休息)"
      },
      {
        name: "原上地社区卫生服务中心保安室",
        address: "上地西路52号",
        latitude: 40.0678,
        longitude: 116.3059,
        services: "全科、西药、护理、检验",
        phone: "62963395",
        hours: "周一至周五8:00-11:30,13:30-17:00(法定节假日休息)"
      },
      {
        name: "中心预防保健科",
        address: "厢黄旗东路柳浪家园北里11号楼A4室",
        latitude: 40.0685,
        longitude: 116.3122,
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

  // 拨打电话 - 直接拨打，无提示框
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

  // 导航到位置
  showLocation: function (e) {
    const index = e.currentTarget.dataset.index;
    const center = this.data.healthCenters[index];
    
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
      confirmColor: '#FF6B35',
      success: (res) => {
        if (res.confirm) {
          // 用户点击确定，调用微信地图导航
          wx.openLocation({
            latitude: center.latitude,
            longitude: center.longitude,
            name: center.name,
            address: center.address,
            fail: (err) => {
              console.error('打开地图失败:', err);
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
});
