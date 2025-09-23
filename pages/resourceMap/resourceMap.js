// pages/resourceMap/resourceMap.js
Page({
  data: {
    serviceCenters: [
      {
        name: "上地街道养老服务中心",
        address: "北京市海淀区裕景西路 12 号院12 号楼",
        manager: "刘庆涛",
        phone: "13241086095 82721989"
      },
      {
        name: "通用康养风华北京上地街道养老照料中心",
        address: "北京市海淀区农大南路厢黄旗万树园27号楼",
        manager: "张朝侠",
        phone: "13466555356"
      },
      {
        name: "上地南路社区养老服务驿站",
        address: "上地佳园1号楼底商",
        manager: "李赞颖",
        phone: "18610629965"
      },
      {
        name: "树村社区养老服务驿站",
        address: "树村丽景苑社区3号楼一层东3室",
        manager: "李殷祺",
        phone: "18614026617"
      },
      {
        name: "东馨园社区养老服务驿站",
        address: "东馨园12号楼底商",
        manager: "蒋妍",
        phone: "18610629965"
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

  callPhone: function (e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone.split(' ')[0] // 如果有多个号码，取第一个
    });
  }
})