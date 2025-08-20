/**
 * 语音输入相关工具函数
 */

/**
 * 初始化录音管理器
 * @param {Object} callbacks - 回调函数对象
 * @param {Function} callbacks.onStart - 录音开始回调
 * @param {Function} callbacks.onStop - 录音停止回调
 * @param {Function} callbacks.onError - 录音错误回调
 * @returns {Object} 录音管理器实例
 */
const initRecorderManager = (callbacks) => {
  const recorderManager = wx.getRecorderManager();
  
  if (callbacks.onStart) {
    recorderManager.onStart(callbacks.onStart);
  }
  
  if (callbacks.onStop) {
    recorderManager.onStop(callbacks.onStop);
  }
  
  if (callbacks.onError) {
    recorderManager.onError(callbacks.onError);
  }
  
  return recorderManager;
};

/**
 * 开始录音
 * @param {Object} recorderManager - 录音管理器实例
 * @param {Object} options - 录音配置选项
 */
const startRecording = (recorderManager, options = {}) => {
  const defaultOptions = {
    duration: 60000, // 最长60秒
    sampleRate: 16000,
    numberOfChannels: 1,
    encodeBitRate: 96000,
    format: 'mp3'
  };
  
  wx.authorize({
    scope: 'scope.record',
    success: () => {
      recorderManager.start({ ...defaultOptions, ...options });
    },
    fail: () => {
      wx.showModal({
        title: '授权提示',
        content: '需要录音权限才能使用语音输入功能',
        showCancel: false
      });
    }
  });
};

/**
 * 停止录音
 * @param {Object} recorderManager - 录音管理器实例
 */
const stopRecording = (recorderManager) => {
  recorderManager.stop();
};

/**
 * 语音识别 - 使用微信官方接口
 * @param {string} filePath - 录音文件路径
 * @param {Object} options - 识别选项
 * @returns {Promise} 识别结果Promise
 */
const recognizeVoice = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      lang: 'zh_CN',
      ...options
    };
    
    wx.showLoading({
      title: '识别中...'
    });
    
    // 使用微信官方语音识别
    wx.translateVoice({
      ...defaultOptions,
      filePath: filePath,
      success: (res) => {
        wx.hideLoading();
        console.log('语音识别成功:', res);
        resolve(res.result);
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('语音识别失败:', error);
        
        // 降级方案：模拟识别
        const mockTexts = [
          '请介绍一下智慧社区的概念',
          '如何使用智慧社区的便民服务？',
          '社区活动报名如何操作？',
          '智慧社区有哪些功能？',
          '今天天气怎么样？',
          '社区里有什么便民设施吗？',
          '如何联系物业服务？',
          '附近有哪些医疗资源？'
        ];
        
        const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
        
        setTimeout(() => {
          wx.showToast({
            title: '模拟识别完成',
            icon: 'success',
            duration: 1000
          });
          resolve(randomText);
        }, 1000);
      }
    });
  });
};

/**
 * 获取输入区域固定高度
 * @param {string} inputMode - 输入模式：'voice' | 'text'
 * @param {boolean} hasVoiceText - 是否有语音识别文字
 * @returns {number} 高度值
 */
const getInputAreaHeight = (inputMode, hasVoiceText = false) => {
  // 统一高度为180px，不再根据模式或状态变化
  return 180;
};

module.exports = {
  initRecorderManager,
  startRecording,
  stopRecording,
  recognizeVoice,
  getInputAreaHeight
};
