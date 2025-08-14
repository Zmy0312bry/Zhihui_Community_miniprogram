/**
 * 智谱AI相关API工具
 */

const app = getApp();

/**
 * 调用智谱AI的对话补全API
 * 支持流式输出
 * @param {Array} messages 消息列表，包含角色和内容
 * @param {Function} onData 流式输出的数据回调
 * @param {Function} onComplete 完成回调
 * @param {Function} onError 错误回调
 * @param {Obj    complete: () => {
      console.log('智谱AI请求完成，获取内容长度:', fullContent.length, '是否已完成:', isDone);
      
      // 如果没有正确触发onComplete，确保在这里触发
      if (!isDone && fullContent && !hasCompleteCalled) {
        console.log('在complete回调中发送完成通知，内容长度:', fullContent.length);
        hasCompleteCalled = true;
        if (onComplete) {
          onComplete(fullContent);
        }
      } else if (!fullContent && !isDone && !hasCompleteCalled) {
        // 如果整个请求过程没有任何内容返回，并且onError还没被调用
        console.warn('智谱AI没有返回任何内容，请检查API地址和密钥配置');
        hasCompleteCalled = true;
        if (onError) {
          onError({
            errorCode: 'REQUEST_FAILED',
            errorMsg: '请求智谱AI服务失败，请检查网络和API配置',
          });
        }
      }
    }
 */
function callZhipuAI(messages, onData, onComplete, onError, options) {
  options = options || {};
  console.log('调用智谱AI，模型:', options.model || app.globalData.config.zhipuAIConfig.model);
  
  try {
    // 检查网络状态
    wx.getNetworkType({
      success: function(res) {
        console.log('当前网络类型:', res.networkType);
        if (res.networkType === 'none') {
          console.error('网络连接不可用，可能导致API调用失败');
        }
      }
    });
    
    // 参数校验
    if (!Array.isArray(messages) || messages.length === 0) {
      console.error('调用智谱AI错误: 消息列表为空或格式不正确');
      if (onError) {
        onError({
          errorCode: 'INVALID_PARAMS',
          errorMsg: '消息列表为空或格式不正确'
        });
      }
      return null;
    }
    
    // 检查配置
    const config = app.globalData.config.zhipuAIConfig;
    if (!config || !config.apiKey || !config.apiUrl) {
      console.error('智谱AI配置错误: 缺少必要的配置项', config);
      if (onError) {
        onError({
          errorCode: 'CONFIG_ERROR',
          errorMsg: '智谱AI配置错误: 缺少必要的配置项'
        });
      }
      return null;
    }

    // 创建一个错误包装器，支持失败时重试
    const MAX_RETRIES = 1; // 最多重试一次
    let currentRetryCount = 0;
    
    const errorHandler = (error) => {
      // 如果是500错误，可以尝试重试
      if (error && (error.errorCode === 500 || error.errorCode === 'REQUEST_FAILED') && currentRetryCount < MAX_RETRIES) {
        currentRetryCount++;
        console.log(`智谱AI请求失败(${error.errorCode})，尝试重试(${currentRetryCount}/${MAX_RETRIES})...`);
        
        // 延迟1秒后重试，避免立即发起可能导致的级联失败
        setTimeout(() => {
          console.log('开始重试智谱AI请求...');
          callZhipuAIStream(messages, onData, onComplete, onError, options);
        }, 1000);
        return;
      }
      
      // 已达到最大重试次数或不是可重试的错误，直接调用原始错误处理
      if (onError) onError(error);
    };
    
    // 重定向到流式API，传入错误处理包装器
    return callZhipuAIStream(messages, onData, onComplete, errorHandler, options);
  } catch (err) {
    console.error('调用智谱AI过程中发生异常:', err);
    if (onError) {
      onError({
        errorCode: 'EXCEPTION',
        errorMsg: '调用过程发生异常',
        error: err
      });
    }
    return null;
  }
}

/**
 * 非流式调用智谱AI的对话补全API
 * @param {Array} messages 消息列表，包含角色和内容
 * @param {Object} options 其他选项
 * @returns {Promise} 返回一个Promise对象
 */
function callZhipuAINonStream(messages, options) {
  options = options || {};
  return new Promise((resolve, reject) => {
    // 获取配置信息
    const config = app.globalData.config.zhipuAIConfig;
    
    // 构建请求参数，根据智谱AI对话补全API规范
    const requestData = {
      model: options.model || config.model,
      messages: messages,
      stream: false,
      temperature: options.temperature || 0.7
      // 简化请求参数，减少可能的错误点
    };

    // 构建请求头
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    };

    // 记录请求详情，方便调试
    console.log('调用智谱AI非流式API:', {
      url: config.apiUrl,
      model: requestData.model,
      messageCount: messages.length
    });
    
    wx.request({
      url: config.apiUrl,
      method: 'POST',
      header: headers,
      data: requestData,
      success: (res) => {
        console.log('智谱AI非流式响应状态:', res.statusCode);
        
        // 检查API错误响应
        if (res.data && res.data.error) {
          const error = res.data.error;
          console.error('智谱AI返回错误:', error);
          reject({
            errorCode: error.type || 'API_ERROR',
            errorMsg: error.message || '智谱AI返回错误',
            details: error
          });
          return;
        }
        
        if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
          try {
            const content = res.data.choices[0].message.content;
            console.log('智谱AI响应成功，内容长度:', content.length);
            resolve(content);
          } catch (e) {
            console.error('处理智谱AI响应失败:', e, '响应数据:', JSON.stringify(res.data).substring(0, 200));
            reject({
              errorCode: 'PARSING_ERROR',
              errorMsg: '解析智谱AI响应失败',
              error: e,
              response: res.data
            });
          }
        } else {
          console.error('智谱AI请求异常:', res.statusCode, res.data);
          reject({
            errorCode: res.statusCode || 'RESPONSE_ERROR',
            errorMsg: '智谱AI请求返回异常状态',
            response: res.data
          });
        }
      },
      fail: (err) => {
        console.error('智谱AI请求网络失败:', err);
        reject({
          errorCode: 'NETWORK_ERROR',
          errorMsg: err.errMsg || '网络请求失败',
          details: err
        });
      }
    });
  });
}

/**
 * 流式调用智谱AI的对话补全API
 * 使用wx.request的enableChunked选项和onChunkReceived回调实现流式接收
 * @param {Array} messages 消息列表，包含角色和内容
 * @param {Function} onData 流式输出的数据回调
 * @param {Function} onComplete 完成回调
 * @param {Function} onError 错误回调
 * @param {Object} options 其他选项
 */
function callZhipuAIStream(messages, onData, onComplete, onError, options) {
  options = options || {};
  // 获取配置信息
  const config = app.globalData.config.zhipuAIConfig;
  
  // 构建请求参数，严格按照curl格式
  const requestData = {
    model: options.model || config.model,
    do_sample: false,
    stream: true,
    thinking: {
      type: "disabled"
    },
    temperature: options.temperature || 0.6,
    top_p: 0.95,
    response_format: {
      type: "text"
    },
    messages: messages
  };

  // 验证API密钥格式
  if (!config.apiKey || typeof config.apiKey !== 'string') {
    console.error('智谱AI API密钥格式不正确:', config.apiKey);
    if (onError) {
      onError({
        errorCode: 'INVALID_API_KEY',
        errorMsg: 'API密钥格式不正确'
      });
    }
    return null;
  }

  // 构建请求头
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`
  };

  let fullContent = '';
  let taskId = null;
  let isDone = false;
  let hasCompleteCalled = false;
  
  // 流式处理相关变量 - 参考博客优化
  let lastData = new Uint8Array(); // 缓存未完整解析的二进制数据
  let lastText = ''; // 缓存未完整的文本数据
  let textBuffer = ''; // 文本数据缓冲区，用于处理不完整的SSE事件
  
  // SSE数据处理常量
  const SSE_DATA_PREFIX = 'data: ';
  const SSE_EVENT_SEPARATOR = '\n\n';
  const SSE_LINE_SEPARATOR = '\n';
  const SSE_DONE_SIGNAL = '[DONE]';
  
  /**
   * 将ArrayBuffer/Uint8Array转换为UTF-8字符串
   * 参考博客方法，优化编码处理
   */
  const arrayBufferToString = (buffer) => {
    try {
      if (buffer instanceof ArrayBuffer) {
        buffer = new Uint8Array(buffer);
      }
      
      // 使用TextDecoder进行UTF-8解码，更可靠
      if (typeof TextDecoder !== 'undefined') {
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(buffer);
      }
      
      // 降级方案：逐字节转换
      let result = '';
      for (let i = 0; i < buffer.length; i++) {
        result += String.fromCharCode(buffer[i]);
      }
      return decodeURIComponent(escape(result));
    } catch (error) {
      console.error('字符串转换失败:', error);
      return '';
    }
  };
  
  /**
   * 处理接收到的数据块
   * 参考博客思路，改进数据拼接和缓存逻辑
   */
  const processDataChunk = (chunkData) => {
    const dataLength = chunkData && (chunkData.length || chunkData.byteLength) || 0;
    console.log('收到数据块，类型:', typeof chunkData, '长度:', dataLength);
    
    let newText = '';
    
    if (chunkData instanceof ArrayBuffer || chunkData instanceof Uint8Array) {
      // 合并之前缓存的二进制数据和新数据
      const currentData = chunkData instanceof ArrayBuffer ? new Uint8Array(chunkData) : chunkData;
      const mergedData = new Uint8Array(lastData.length + currentData.length);
      mergedData.set(lastData, 0);
      mergedData.set(currentData, lastData.length);
      
      try {
        // 尝试解码合并后的数据
        newText = arrayBufferToString(mergedData);
        lastData = new Uint8Array(); // 清空缓存
        console.log('成功解码数据，长度:', newText.length);
      } catch (error) {
        console.log('解码失败，数据不完整，继续缓存');
        lastData = mergedData; // 缓存数据等待下次合并
        return [];
      }
    } else if (typeof chunkData === 'string') {
      newText = chunkData;
    } else {
      console.warn('未知的数据类型:', typeof chunkData);
      return [];
    }
    
    // 将新文本添加到缓冲区
    textBuffer += newText;
    
    // 按SSE事件分隔符分割数据
    const events = textBuffer.split(SSE_EVENT_SEPARATOR);
    
    // 保留最后一个不完整的事件（如果存在）
    if (events.length > 1) {
      textBuffer = events.pop() || '';
      return events.filter(event => event.trim());
    }
    
    return [];
  };
  
  /**
   * 解析SSE事件数据
   * 按照SSE规范解析事件
   */
  const parseSseEvent = (eventText) => {
    const lines = eventText.split(SSE_LINE_SEPARATOR);
    let data = '';
    
    for (const line of lines) {
      if (line.startsWith(SSE_DATA_PREFIX)) {
        data += line.substring(SSE_DATA_PREFIX.length);
      }
    }
    
    return data.trim();
  };
  
  /**
   * 处理单个SSE数据
   * 优化JSON解析和内容提取
   */
  const processSseData = (dataText) => {
    if (!dataText) return;
    
    console.log('处理SSE数据:', dataText);
    
    // 检查结束标记
    if (dataText === SSE_DONE_SIGNAL) {
      console.log('收到流式结束信号');
      isDone = true;
      if (onComplete && !hasCompleteCalled) {
        hasCompleteCalled = true;
        console.log('触发完成回调，最终内容长度:', fullContent.length);
        onComplete(fullContent);
      }
      return;
    }
    
    try {
      const jsonData = JSON.parse(dataText);
      console.log('解析JSON成功:', {
        id: jsonData.id,
        model: jsonData.model,
        choicesCount: jsonData.choices && jsonData.choices.length
      });
      
      // 检查API错误
      if (jsonData.error) {
        console.error('API返回错误:', jsonData.error);
        if (onError && !hasCompleteCalled) {
          hasCompleteCalled = true;
          onError({
            errorCode: 'API_ERROR',
            errorMsg: jsonData.error.message || 'API返回错误',
            details: jsonData.error
          });
        }
        return;
      }
      
      // 处理choices数据
      if (jsonData.choices && jsonData.choices.length > 0) {
        const choice = jsonData.choices[0];
        
        // 检查完成原因
        if (choice.finish_reason) {
          console.log('收到完成信号:', choice.finish_reason);
          if (choice.finish_reason === 'stop') {
            isDone = true;
            if (onComplete && !hasCompleteCalled) {
              hasCompleteCalled = true;
              console.log('stop信号触发完成回调，最终内容长度:', fullContent.length);
              onComplete(fullContent);
            }
          }
          return;
        }
        
        // 提取增量内容
        if (choice.delta && typeof choice.delta.content === 'string') {
          const deltaContent = choice.delta.content;
          fullContent += deltaContent;
          
          console.log('收到增量内容，长度:', deltaContent.length, '累积长度:', fullContent.length);
          
          // 触发数据回调
          if (onData && deltaContent) {
            onData(deltaContent, fullContent);
          }
        }
      }
    } catch (parseError) {
      console.error('JSON解析失败:', parseError.message);
      console.error('原始数据:', dataText.substring(0, 200) + (dataText.length > 200 ? '...' : ''));
      
      // 不将JSON解析错误视为致命错误，继续处理
    }
  };

  console.log('发起智谱AI流式请求:', {
    url: config.apiUrl,
    model: requestData.model,
    messageCount: messages.length
  });
  
  // 创建任务来处理流式响应
  taskId = wx.request({
    url: config.apiUrl,
    method: 'POST',
    header: headers,
    data: requestData,
    enableChunked: true,
    responseType: 'arraybuffer', // 明确指定返回类型
    onChunkReceived: (res) => {
      try {
        console.log('收到chunk，响应状态:', res.statusCode);
        
        // 处理数据块，获取完整的SSE事件
        const completeEvents = processDataChunk(res.data);
        
        // 处理每个完整的SSE事件
        completeEvents.forEach(eventText => {
          const sseData = parseSseEvent(eventText);
          if (sseData) {
            processSseData(sseData);
          }
        });
        
      } catch (error) {
        console.error('chunk处理异常:', error);
        if (onError && !hasCompleteCalled) {
          hasCompleteCalled = true;
          onError({
            errorCode: 'CHUNK_PROCESS_ERROR',
            errorMsg: '数据处理异常: ' + error.message,
            details: error
          });
        }
      }
    },
    success: (res) => {
      console.log('请求完成 - 状态码:', res.statusCode);
      console.log('最终状态 - 内容长度:', fullContent.length, 'isDone:', isDone, 'hasCompleteCalled:', hasCompleteCalled);
      
      // 处理缓冲区中剩余的数据
      if (textBuffer.trim()) {
        console.log('处理缓冲区剩余数据:', textBuffer.trim().substring(0, 100));
        const finalEvent = parseSseEvent(textBuffer);
        if (finalEvent) {
          processSseData(finalEvent);
        }
        textBuffer = ''; // 清空缓冲区
      }
      
      // 检查HTTP状态码
      if (res.statusCode !== 200) {
        console.error('HTTP请求失败:', res.statusCode);
        if (onError && !hasCompleteCalled) {
          hasCompleteCalled = true;
          onError({
            errorCode: res.statusCode,
            errorMsg: `HTTP请求失败: ${res.statusCode}`
          });
        }
        return;
      }
      
      // 确保完成回调被触发
      if (!hasCompleteCalled) {
        hasCompleteCalled = true;
        if (fullContent || isDone) {
          console.log('success中触发完成回调，内容长度:', fullContent.length);
          if (onComplete) onComplete(fullContent);
        } else {
          console.log('success中无有效响应，触发错误回调');
          if (onError) {
            onError({
              errorCode: 'NO_CONTENT',
              errorMsg: '请求完成但未收到有效响应内容'
            });
          }
        }
      }
    },
    fail: (err) => {
      console.error('请求失败:', err);
      if (onError && !hasCompleteCalled) {
        hasCompleteCalled = true;
        onError({
          errorCode: 'NETWORK_ERROR',
          errorMsg: err.errMsg || '网络请求失败'
        });
      }
    },
    complete: () => {
      console.log('请求完成 - 清理阶段');
      console.log('最终状态:', {
        isDone,
        contentLength: fullContent.length,
        hasCompleteCalled,
        bufferRemaining: textBuffer.length
      });
      
      // 最终安全检查和清理
      if (!hasCompleteCalled) {
        hasCompleteCalled = true;
        
        if (fullContent) {
          console.log('complete阶段触发完成回调');
          if (onComplete) onComplete(fullContent);
        } else {
          console.log('complete阶段触发错误回调 - 无响应');
          if (onError) {
            onError({
              errorCode: 'NO_RESPONSE',
              errorMsg: '请求完成但未收到任何有效响应'
            });
          }
        }
      }
      
      // 清理资源
      lastData = null;
      textBuffer = '';
    }
  });

  // 格式化任务ID输出
  const formattedTaskId = {
    uniqueId: Date.now() + Math.floor(Math.random() * 10000),
    taskInvoker: 'zhipuAI', // 明确设置任务调用者
    requestId: taskId
  };
  console.log('智谱AI任务ID:', formattedTaskId);
  return formattedTaskId; // 返回格式化后的任务ID对象，而不是原始的requestId
}

module.exports = {
  callZhipuAI,
  callZhipuAINonStream,
  callZhipuAIStream
};
