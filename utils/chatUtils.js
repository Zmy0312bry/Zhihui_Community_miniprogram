/**
 * AI聊天相关工具函数
 */

/**
 * 格式化时间为聊天显示格式
 * @param {Date|string|number} time - 时间
 * @returns {string} 格式化后的时间字符串
 */
const formatChatTime = (time) => {
  const date = new Date(time);
  const now = new Date();
  const diff = now - date;
  
  // 小于1分钟显示"刚刚"
  if (diff < 60000) {
    return '刚刚';
  }
  
  // 小于1小时显示分钟
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  }
  
  // 小于24小时显示小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }
  
  // 超过24小时显示具体时间
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * 生成唯一的消息ID
 * @returns {string} 唯一ID
 */
const generateMessageId = () => {
  return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * 创建用户消息对象
 * @param {string} content - 消息内容
 * @returns {Object} 消息对象
 */
const createUserMessage = (content) => {
  return {
    id: generateMessageId(),
    role: 'user',
    content: content.trim(),
    time: formatChatTime(new Date())
  };
};

/**
 * 创建AI消息对象
 * @param {string} content - 消息内容
 * @returns {Object} 消息对象
 */
const createAIMessage = (content) => {
  return {
    id: generateMessageId(),
    role: 'assistant',
    content: content.trim(),
    time: formatChatTime(new Date())
  };
};

/**
 * 调整文本框高度
 * @param {Object} event - 输入事件
 * @param {Function} setData - 设置数据的函数
 * @param {number} minHeight - 最小高度，默认60
 * @param {number} maxHeight - 最大高度，默认90
 */
const adjustTextareaHeight = (event, setData, minHeight = 60, maxHeight = 90) => {
  const { value } = event.detail;
  const lineHeight = 24; // 单行高度
  const padding = 20; // 上下内边距
  const lines = value.split('\n').length;
  
  let height = Math.max(minHeight, lines * lineHeight + padding);
  height = Math.min(height, maxHeight);
  
  setData({
    textareaHeight: height
  });
};

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @param {string} successMessage - 成功提示，默认"复制成功"
 */
const copyToClipboard = (text, successMessage = '复制成功') => {
  wx.setClipboardData({
    data: text,
    success: () => {
      wx.showToast({
        title: successMessage,
        icon: 'success',
        duration: 1500
      });
    },
    fail: () => {
      wx.showToast({
        title: '复制失败',
        icon: 'none',
        duration: 1500
      });
    }
  });
};

/**
 * 滚动到聊天底部
 * @param {Function} setData - 设置数据的函数
 * @param {number} delay - 延迟时间，默认100ms
 */
const scrollToBottom = (setData, delay = 100) => {
  setTimeout(() => {
    setData({
      scrollTop: 999999
    });
  }, delay);
};

/**
 * 验证消息内容
 * @param {string} content - 消息内容
 * @returns {Object} 验证结果 {valid: boolean, message: string}
 */
const validateMessage = (content) => {
  if (!content || !content.trim()) {
    return {
      valid: false,
      message: '请输入消息内容'
    };
  }
  
  if (content.trim().length > 500) {
    return {
      valid: false,
      message: '消息内容不能超过500字符'
    };
  }
  
  return {
    valid: true,
    message: ''
  };
};

module.exports = {
  formatChatTime,
  generateMessageId,
  createUserMessage,
  createAIMessage,
  adjustTextareaHeight,
  copyToClipboard,
  scrollToBottom,
  validateMessage
};
