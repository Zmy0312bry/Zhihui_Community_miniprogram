// pages/policies/policies.js
const app = getApp();

Page({
  data: {
    // 展开状态
    expandedCategories: {
      care: false,
      assessment: false
    },

    // 养老照护床位政策
    carePolicies: [
      {
        id: 1,
        title: "海淀区养老家庭照护床位服务宣传海报",
        file: "pdf1.pdf",
        desc: "养老家庭照护床位服务相关宣传内容"
      },
      {
        id: 2,
        title: "海淀区民政局关于印发《海淀区养老家庭照护床位护理服务机构管理办法（试行）》的通知",
        file: "pdf3.pdf",
        desc: "养老家庭照护床位护理服务机构管理办法"
      },

      {
        id: 5,
        title: "海淀区民政局关于印发《海淀区养老家庭照护床位建设管理实施细则》",
        file: "pdf5.pdf",
        desc: "养老家庭照护床位建设管理实施细则"
      }
    ],

    // 老年人能力评估政策
    assessmentPolicies: [
      {
        id: 3,
        title: "关于消化存量评估攻坚行动实施方案的通知",
        file: "pdf2.pdf",
        desc: "消化存量评估攻坚行动实施方案"
      },
      {
        id: 4,
        title: "北京市老年人能力评估实施办法",
        file: "pdf4.pdf",
        desc: "老年人能力评估相关实施办法"
      }
    ],

    // PDF预览相关
    showPdfViewer: false,
    pdfUrl: '',
    currentPdfTitle: ''
  },

  onLoad: function (options) {
    console.log('政策法规页面加载完成');
  },

  onShow: function () {
    // 页面显示时的处理
  },

  // 切换分类展开状态
  toggleCategory: function (e) {
    const category = e.currentTarget.dataset.category;
    const expandedCategories = this.data.expandedCategories;

    this.setData({
      [`expandedCategories.${category}`]: !expandedCategories[category]
    });
  },

  // 查看PDF文件
  viewPdf: function (e) {
    const file = e.currentTarget.dataset.file;
    const title = e.currentTarget.dataset.title;
    const fileUrl = app.getFileUrl(file);

    console.log('查看PDF:', file, title, fileUrl);

    // 使用embed版本的PDF查看器HTML文件
    const baseUrl = 'https://shangdi.bjseeyoung.com/media/file/pdf-viewer.html';
    const viewerUrl = `${baseUrl}?url=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(title)}`;

    console.log('构建的查看器URL:', viewerUrl);

    // 显示PDF预览
    this.setData({
      showPdfViewer: true,
      pdfUrl: viewerUrl,
      currentPdfTitle: title
    });

    console.log('PDF预览已显示');
  },

  // 关闭PDF预览
  closePdfViewer: function () {
    console.log('关闭PDF预览');

    this.setData({
      showPdfViewer: false,
      pdfUrl: '',
      currentPdfTitle: ''
    });

    console.log('PDF预览已关闭');
  },

  // 阻止web-view区域的点击事件冒泡
  preventClose: function (e) {
    // 阻止事件冒泡，防止点击web-view时关闭预览
    e.stopPropagation();
  }
});
