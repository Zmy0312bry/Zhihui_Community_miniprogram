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
function callZhipuAI(messages, onData, onComplete, onError, options = {}) {
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
function callZhipuAINonStream(messages, options = {}) {
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
function callZhipuAIStream(messages, onData, onComplete, onError, options = {}) {
  // 获取配置信息
  const config = app.globalData.config.zhipuAIConfig;
  
  // 构建请求参数，根据智谱AI对话补全API规范
  const requestData = {
    model: options.model || config.model,
    messages: messages,
    stream: true, // 必须设置为流式返回
    do_sample: false, // 按照示例固定值
    temperature: options.temperature || 0.6,
    top_p: 0.95,
    thinking: {
      type: "disabled"
    },
    response_format: {
      type: "text"
    }
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
  let hasCompleteCalled = false; // 添加标记，避免重复调用complete回调

  // 记录请求详情，方便调试
  console.log('调用智谱AI API:', {
    url: config.apiUrl,
    model: requestData.model,
    messageCount: messages.length,
    stream: true
  });
  
  // 验证messages格式是否正确
  if (messages && Array.isArray(messages)) {
    let hasValidMessage = false;
    for (const msg of messages) {
      if (msg && msg.role && msg.content) {
        hasValidMessage = true;
        // 验证格式正确
      } else {
        console.error('无效的消息格式:', msg);
      }
    }
    
    if (!hasValidMessage) {
      console.error('消息数组中没有有效的消息对象!');
      if (onError) {
        onError({
          errorCode: 'INVALID_MESSAGE_FORMAT',
          errorMsg: '消息格式不正确，必须包含role和content字段'
        });
      }
      return null;
    }
  } else {
    console.error('消息参数不是有效的数组!');
    if (onError) {
      onError({
        errorCode: 'INVALID_MESSAGE_FORMAT',
        errorMsg: '消息参数必须是数组'
      });
    }
    return null;
  }
  
  // 输出简化请求体，调试用
  console.log('API请求体(简化版):', JSON.stringify({
    model: requestData.model,
    messages: requestData.messages.map(m => ({ role: m.role, content: m.content ? (m.content.length > 20 ? m.content.substring(0, 20) + '...' : m.content) : null }))
  }));
  
  // 输出完整请求体
  console.log('API完整请求体:', JSON.stringify(requestData));
  
  // 创建任务来处理流式响应
  taskId = wx.request({
    url: config.apiUrl,
    method: 'POST',
    header: headers,
    data: requestData,
    enableChunked: true, // 开启分块接收
    responseType: 'text',
    onChunkReceived: (res) => {
      try {
        const chunk = res.data;
        console.log('智谱AI流式数据块：', chunk);
        
        if (!chunk) return;
        
        // 处理流式响应数据
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          console.log('处理SSE行：', trimmedLine);
          
          // 检查结束标记
          if (trimmedLine === 'data: [DONE]') {
            console.log('流式响应结束');
            isDone = true;
            if (onComplete && !hasCompleteCalled) {
              hasCompleteCalled = true;
              onComplete(fullContent || '');
            }
            return;
          }
          
          // 处理数据行
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.substring(6);
              if (!jsonStr) continue;
              
              const jsonData = JSON.parse(jsonStr);
              console.log('解析的JSON：', jsonData);
              
              // 检查错误
              if (jsonData.error) {
                console.error('API错误:', jsonData.error);
                if (onError && !hasCompleteCalled) {
                  hasCompleteCalled = true;
                  onError({
                    errorCode: 'API_ERROR',
                    errorMsg: jsonData.error.message || 'API返回错误'
                  });
                }
                return;
              }
              
              // 处理choices数据
              if (jsonData.choices && jsonData.choices[0]) {
                const choice = jsonData.choices[0];
                
                // 检查finish_reason
                if (choice.finish_reason === 'stop') {
                  console.log('收到stop信号');
                  isDone = true;
                  continue;
                }
                
                // 提取delta内容
                if (choice.delta && choice.delta.content) {
                  const content = choice.delta.content;
                  fullContent += content;
                  console.log('增量内容:', content);
                  console.log('累积内容长度:', fullContent.length);
                  
                  // 触发数据回调
                  if (onData) {
                    onData(content, fullContent);
                  }
                }
              }
            } catch (parseError) {
              console.error('JSON解析失败:', parseError, '原始数据:', jsonStr);
            }
          }
        }
      } catch (e) {
        console.error('流式处理错误:', e);
        if (onError && !hasCompleteCalled) {
          hasCompleteCalled = true;
          onError({
            errorCode: 'STREAM_ERROR',
            errorMsg: '流式处理失败: ' + e.message
          });
        }
      }
    },
    success: (res) => {
      console.log('请求完成 - 状态码:', res.statusCode);
      console.log('累积内容长度:', fullContent.length);
      console.log('是否已完成:', isDone);
      
      if (res.statusCode !== 200) {
        console.error('HTTP错误:', res.statusCode);
        if (onError && !hasCompleteCalled) {
          hasCompleteCalled = true;
          onError({
            errorCode: res.statusCode,
            errorMsg: `HTTP错误: ${res.statusCode}`
          });
        }
        return;
      }
      
      // 如果有内容但还没有完成回调，触发完成
      if (!hasCompleteCalled) {
        hasCompleteCalled = true;
        if (fullContent) {
          console.log('success中触发完成回调，内容长度:', fullContent.length);
          if (onComplete) onComplete(fullContent);
        } else {
          console.log('success中无内容，触发错误回调');
          if (onError) {
            onError({
              errorCode: 'NO_CONTENT',
              errorMsg: '未收到任何响应内容'
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
      console.log('请求完成 - 最终状态');
      console.log('isDone:', isDone, 'fullContent长度:', fullContent.length, 'hasCompleteCalled:', hasCompleteCalled);
      
      // 最后的安全检查
      if (!hasCompleteCalled) {
        hasCompleteCalled = true;
        if (fullContent) {
          console.log('complete中触发完成回调');
          if (onComplete) onComplete(fullContent);
        } else {
          console.log('complete中无内容，触发错误回调');
          if (onError) {
            onError({
              errorCode: 'NO_RESPONSE',
              errorMsg: '请求完成但未收到任何响应'
            });
          }
        }
      }
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
