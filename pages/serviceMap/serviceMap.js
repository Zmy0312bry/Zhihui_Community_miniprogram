// pages/serviceMap/serviceMap.js
Page({
  data: {
    // 社区服务信息 - 一级：社区名称，二级：店铺类型，三级：店铺详细信息
    communities: [
      {
        id: 1,
        name: '东颂园社区',
        expanded: false,
        categories: [
          {
            id: 'catering',
            name: '便民小店（餐饮店）',
            expanded: false,
            shops: [
              {
                name: '养老驿站',
                address: '海淀区环智园乐老门社区养老服务驿站',
                phone: '18601333121',
                hours: '9：00-17：30'
              },
              {
                name: '人合百旺美食城',
                address: '海淀区东北旺街道48号',
                phone: '13910133397',
                hours: '6：00-24：00'
              }
            ]
          },
          {
            id: 'dining',
            name: '便民小店（便利店）',
            expanded: false,
            shops: [
              {
                name: '维兰西餐',
                address: '海淀区东北旺街混淆段入中学北钱镇分交叉处',
                phone: '15203257900',
                hours: '11：00-14：00 17：00-21：00'
              },
              {
                name: '常玖坡山阴肉美馄',
                address: '海淀区东北旺街道38号',
                phone: '17310417423',
                hours: '10：00-22：00'
              }
            ]
          }
        ]
      },
      {
        id: 2,
        name: '万树园社区',
        expanded: false,
        categories: [
          {
            id: 'catering',
            name: '便民小店（餐饮店）',
            expanded: false,
            shops: [
              {
                name: '千禧百世生活超市（东北店）',
                address: '海淀区东北旺街道29号',
                phone: '18656875711',
                hours: '8：30-21：00'
              },
              {
                name: '中车汽车维修喷漆（东营店）',
                address: '海淀区东北旺街乐乐园小区12号楼底商1-105',
                phone: '13661233269',
                hours: '08：00-18：00'
              }
            ]
          },
          {
            id: 'life_service',
            name: '生活服务',
            expanded: false,
            shops: [
              {
                name: '爱尚港型',
                address: '海淀区东北旺街南路29号旭阳小区北门底商',
                phone: '18600019569',
                hours: '10:00-21:00'
              }
            ]
          }
        ]
      },
      {
        id: 3,
        name: '上地东里社区',
        expanded: false,
        categories: [
          {
            id: 'catering',
            name: '便民小店（餐饮店）',
            expanded: false,
            shops: [
              {
                name: '善家老干土脚鱼、辣炒鸡、下饭菜',
                address: '海淀区北京城区信息路30号上地大厦F1层A101',
                phone: '010-88380920',
                hours: '周一至周日 10:00-14:00；17:00-22:30'
              },
              {
                name: '柴火圈·烤鸭',
                address: '海淀区北京城区信息路30号上地大厦F1层',
                phone: '13520961874',
                hours: '周一至周日 6:00-9:30；10:30-21:30'
              }
            ]
          },
          {
            id: 'dessert',
            name: '便民小店（甜品店）',
            expanded: false,
            shops: [
              {
                name: '北炸锅内',
                address: '海淀区北京城区信息路30号上地大厦F2层',
                phone: '010-82772880',
                hours: '周一至周日 10:30-23:00'
              },
              {
                name: '蚝状元大闸蟹（北京上地店）',
                address: '海淀区上地东路1号上地东园23号楼底商1-8',
                phone: '010-62966977',
                hours: '周一至周日 09:00-18:00'
              }
            ]
          }
        ]
      },
      {
        id: 4,
        name: '上地西里社区',
        expanded: false,
        categories: [
          {
            id: 'catering',
            name: '便民小店（餐饮店）',
            expanded: false,
            shops: [
              {
                name: '嘉和一品',
                address: '北京市海淀区信息路19号',
                phone: '17746533264',
                hours: '6：30-21:30'
              },
              {
                name: '超市发',
                address: '北京市海淀区信息路19号',
                phone: '82897280',
                hours: '8:00-21:30'
              }
            ]
          },
          {
            id: 'service',
            name: '生活服务',
            expanded: false,
            shops: [
              {
                name: '北京宏居上地物业',
                address: '北京市海淀区信息路22号上地技术合楼1212室',
                phone: '010-62987349',
                hours: '8:30-17:00'
              },
              {
                name: '建设银行',
                address: '北京市海淀区信息路19号',
                phone: '15101159197',
                hours: '9:00-17:00'
              }
            ]
          }
        ]
      }
    ]
  },

  onLoad: function (options) {
    console.log('服务地图页面加载');
  },

  onShow: function () {
    console.log('服务地图页面显示');
  },

  // 切换社区展开/收缩
  toggleCommunity: function(e) {
    const index = e.currentTarget.dataset.index;
    const communities = this.data.communities;
    communities[index].expanded = !communities[index].expanded;
    this.setData({ communities });
  },

  // 切换类别展开/收缩
  toggleCategory: function(e) {
    const communityIndex = e.currentTarget.dataset.communityIndex;
    const categoryIndex = e.currentTarget.dataset.categoryIndex;
    const communities = this.data.communities;
    communities[communityIndex].categories[categoryIndex].expanded = !communities[communityIndex].categories[categoryIndex].expanded;
    this.setData({ communities });
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack({
      delta: 1
    });
  }
});
