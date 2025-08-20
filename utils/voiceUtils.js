/**
 * 语音输入相关工具函数
 */

// 引入微信同声传译插件
const plugin = requirePlugin("WechatSI");

/**
 * 初始化录音识别管理器（使用WechatSI插件）
 * @param {Object} callbacks - 回调函数对象
 * @param {Function} callbacks.onStart - 录音开始回调
 * @param {Function} callbacks.onStop - 录音停止回调  
 * @param {Function} callbacks.onError - 录音错误回调
 * @returns {Object} 录音识别管理器实例
 */
const initRecorderManager = (callbacks) => {
  // 使用WechatSI插件的录音识别管理器
  const manager = plugin.getRecordRecognitionManager();
  
  if (callbacks.onStart) {
    manager.onStart = callbacks.onStart;
  }
  
  if (callbacks.onStop) {
    manager.onStop = callbacks.onStop;
  }
  
  if (callbacks.onError) {
    manager.onError = callbacks.onError;
  }
  
  return manager;
};

/**
 * 开始录音识别（使用WechatSI插件）
 * @param {Object} manager - 录音识别管理器实例
 * @param {Object} options - 录音配置选项
 */
const startRecording = (manager, options = {}) => {
  const defaultOptions = {
    duration: 30000, // 最长30秒
    lang: 'zh_CN' // 中文识别
  };
  
  wx.authorize({
    scope: 'scope.record',
    success: () => {
      try {
        manager.start({ ...defaultOptions, ...options });
        console.log('开始录音识别，配置:', { ...defaultOptions, ...options });
      } catch (error) {
        console.error('启动录音识别失败:', error);
        if (options.onError) {
          options.onError({
            retcode: -30007,
            msg: 'start启动参数错误'
          });
        }
      }
    },
    fail: () => {
      wx.showModal({
        title: '授权提示',
        content: '需要录音权限才能使用语音输入功能',
        showCancel: false
      });
      if (options.onError) {
        options.onError({
          retcode: -30001,
          msg: '录音接口出错'
        });
      }
    }
  });
};

/**
 * 停止录音识别
 * @param {Object} manager - 录音识别管理器实例
 */
const stopRecording = (manager) => {
  try {
    manager.stop();
    console.log('停止录音识别');
  } catch (error) {
    console.error('停止录音识别失败:', error);
  }
};

/**
 * 语音识别 - 使用WechatSI插件（已内置在录音识别管理器中）
 * 注意：使用WechatSI插件时，语音识别是在录音过程中自动完成的
 * 识别结果通过manager.onStop回调返回
 * @param {string} filePath - 录音文件路径（WechatSI插件中不需要此参数）
 * @param {Object} options - 识别选项
 * @returns {Promise} 识别结果Promise
 */
const recognizeVoice = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    // 使用WechatSI插件时，语音识别已经在录音过程中完成
    // 这个函数主要用于兼容性，实际识别结果通过onStop回调获取
    console.warn('使用WechatSI插件时，语音识别已在录音过程中自动完成，请通过onStop回调获取结果');
    
    // 返回提示信息
    resolve('请使用录音识别管理器的onStop回调获取识别结果');
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

/**
 * 处理WechatSI插件的错误码
 * @param {number} retcode - 错误码
 * @returns {string} 错误描述
 */
const getErrorMessage = (retcode) => {
  const errorMessages = {
    '-30001': '录音接口出错',
    '-30002': '录音暂停接口被调用，录音终止，识别终止',
    '-30003': '录音帧数据未产生或者发送失败导致的数据传输失败',
    '-30004': '因网络或者其他非正常状态导致的未查询识别结果',
    '-30005': '语音识别服务内部错误',
    '-30006': '语音识别服务未在限定时间内识别完成',
    '-30007': 'start启动参数错误',
    '-30008': '查询请求时网络失败',
    '-30009': '创建鉴权内部失败',
    '-30010': '发送鉴权时网络失败',
    '-30011': '试图在识别正在进行中是再次调用start，返回错误，正在进行的识别任务正常进行',
    '-30012': '当前无识别任务进行时调用stop错误',
    '-30013': '其他未知错误',
    '-40001': '达到接口调用频率限制'
  };
  
  return errorMessages[retcode.toString()] || '未知错误';
};

module.exports = {
  initRecorderManager,
  startRecording,
  stopRecording,
  recognizeVoice,
  getInputAreaHeight,
  getErrorMessage
};
