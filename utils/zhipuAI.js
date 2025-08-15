/**
 * 智谱AI相关API工具
 */

const app = getApp();
// 引入chunk-res库处理HTTP分段响应(本地版本)
const ChunkRes = require('./chunkRes.js');

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
  console.log(
    "调用智谱AI，模型:",
    options.model || app.globalData.config.zhipuAIConfig.model
  );

  try {
    // 检查网络状态
    wx.getNetworkType({
      success: function (res) {
        console.log("当前网络类型:", res.networkType);
        if (res.networkType === "none") {
          console.error("网络连接不可用，可能导致API调用失败");
        }
      },
    });

    // 参数校验
    if (!Array.isArray(messages) || messages.length === 0) {
      console.error("调用智谱AI错误: 消息列表为空或格式不正确");
      if (onError) {
        onError({
          errorCode: "INVALID_PARAMS",
          errorMsg: "消息列表为空或格式不正确",
        });
      }
      return null;
    }

    // 检查配置
    const config = app.globalData.config.zhipuAIConfig;
    if (!config || !config.apiKey || !config.apiUrl) {
      console.error("智谱AI配置错误: 缺少必要的配置项", config);
      if (onError) {
        onError({
          errorCode: "CONFIG_ERROR",
          errorMsg: "智谱AI配置错误: 缺少必要的配置项",
        });
      }
      return null;
    }

    // 创建一个错误包装器，支持失败时重试
    const MAX_RETRIES = 1; // 最多重试一次
    let currentRetryCount = 0;

    const errorHandler = (error) => {
      // 如果是500错误，可以尝试重试
      if (
        error &&
        (error.errorCode === 500 || error.errorCode === "REQUEST_FAILED") &&
        currentRetryCount < MAX_RETRIES
      ) {
        currentRetryCount++;
        console.log(
          `智谱AI请求失败(${error.errorCode})，尝试重试(${currentRetryCount}/${MAX_RETRIES})...`
        );

        // 延迟1秒后重试，避免立即发起可能导致的级联失败
        setTimeout(() => {
          console.log("开始重试智谱AI请求...");
          callZhipuAIStream(messages, onData, onComplete, onError, options);
        }, 1000);
        return;
      }

      // 已达到最大重试次数或不是可重试的错误，直接调用原始错误处理
      if (onError) onError(error);
    };

    // 重定向到流式API，传入错误处理包装器
    return callZhipuAIStream(
      messages,
      onData,
      onComplete,
      errorHandler,
      options
    );
  } catch (err) {
    console.error("调用智谱AI过程中发生异常:", err);
    if (onError) {
      onError({
        errorCode: "EXCEPTION",
        errorMsg: "调用过程发生异常",
        error: err,
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
      temperature: options.temperature || 0.7,
      // 简化请求参数，减少可能的错误点
    };

    // 构建请求头
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    };

    // 记录请求详情，方便调试
    console.log("调用智谱AI非流式API:", {
      url: config.apiUrl,
      model: requestData.model,
      messageCount: messages.length,
    });

    wx.request({
      url: config.apiUrl,
      method: "POST",
      header: headers,
      data: requestData,
      success: (res) => {
        console.log("智谱AI非流式响应状态:", res.statusCode);

        // 检查API错误响应
        if (res.data && res.data.error) {
          const error = res.data.error;
          console.error("智谱AI返回错误:", error);
          reject({
            errorCode: error.type || "API_ERROR",
            errorMsg: error.message || "智谱AI返回错误",
            details: error,
          });
          return;
        }

        if (
          res.statusCode === 200 &&
          res.data &&
          res.data.choices &&
          res.data.choices.length > 0
        ) {
          try {
            const content = res.data.choices[0].message.content;
            console.log("智谱AI响应成功，内容长度:", content.length);
            resolve(content);
          } catch (e) {
            console.error(
              "处理智谱AI响应失败:",
              e,
              "响应数据:",
              JSON.stringify(res.data).substring(0, 200)
            );
            reject({
              errorCode: "PARSING_ERROR",
              errorMsg: "解析智谱AI响应失败",
              error: e,
              response: res.data,
            });
          }
        } else {
          console.error("智谱AI请求异常:", res.statusCode, res.data);
          reject({
            errorCode: res.statusCode || "RESPONSE_ERROR",
            errorMsg: "智谱AI请求返回异常状态",
            response: res.data,
          });
        }
      },
      fail: (err) => {
        console.error("智谱AI请求网络失败:", err);
        reject({
          errorCode: "NETWORK_ERROR",
          errorMsg: err.errMsg || "网络请求失败",
          details: err,
        });
      },
    });
  });
}

/**
 * 流式调用智谱AI的对话补全API
 * 使用chunk-res库处理HTTP分段响应
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

  // 修复messages格式，确保符合智谱AI API要求
  const formattedMessages = messages.map(msg => {
    // 如果content是对象，提取其中的content字段
    if (msg.content && typeof msg.content === 'object' && msg.content.content) {
      return {
        role: msg.role,
        content: msg.content.content
      };
    }
    // 如果content是字符串，直接使用
    else if (typeof msg.content === 'string') {
      return {
        role: msg.role,
        content: msg.content
      };
    }
    // 其他情况返回原始格式
    return msg;
  });

  console.log("原始messages:", messages);
  console.log("格式化后messages:", formattedMessages);

  // 构建请求参数，严格按照curl格式 - 保持不变
  const requestData = {
    model: options.model || config.model,
    do_sample: false,
    stream: true,
    thinking: {
      type: "disabled",
    },
    temperature: options.temperature || 0.6,
    top_p: 0.95,
    response_format: {
      type: "text",
    },
    messages: formattedMessages, // 使用格式化后的messages
  };

  // 验证API密钥格式
  if (!config.apiKey || typeof config.apiKey !== "string") {
    console.error("智谱AI API密钥格式不正确:", config.apiKey);
    if (onError) {
      onError({
        errorCode: "INVALID_API_KEY",
        errorMsg: "API密钥格式不正确",
      });
    }
    return null;
  }

  // 构建请求头 - 保持不变
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey}`,
  };

  let fullContent = "";
  let hasCompleteCalled = false;

  // 创建chunk-res实例
  const chunkRes = ChunkRes();

  /**
   * 处理SSE数据
   * @param {string} dataText SSE数据文本
   */
  const processSseData = (dataText) => {
    if (!dataText || !dataText.trim()) return;

    console.log("处理SSE数据:", dataText.substring(0, 100) + "...");

    // 检查结束标记
    if (dataText.trim() === "[DONE]") {
      console.log("收到流式结束信号");
      if (onComplete && !hasCompleteCalled) {
        hasCompleteCalled = true;
        console.log("触发完成回调，最终内容长度:", fullContent.length);
        onComplete(fullContent);
      }
      return;
    }

    try {
      const jsonData = JSON.parse(dataText);

      // 检查API错误
      if (jsonData.error) {
        console.error("API返回错误:", jsonData.error);
        if (onError && !hasCompleteCalled) {
          hasCompleteCalled = true;
          onError({
            errorCode: "API_ERROR",
            errorMsg: jsonData.error.message || "API返回错误",
            details: jsonData.error,
          });
        }
        return;
      }

      // 处理choices数据
      if (jsonData.choices && jsonData.choices.length > 0) {
        const choice = jsonData.choices[0];

        // 检查完成原因
        if (choice.finish_reason === "stop") {
          console.log("收到完成信号:", choice.finish_reason);
          if (onComplete && !hasCompleteCalled) {
            hasCompleteCalled = true;
            console.log("stop信号触发完成回调，最终内容长度:", fullContent.length);
            onComplete(fullContent);
          }
          return;
        }

        // 提取增量内容
        if (choice.delta && typeof choice.delta.content === "string") {
          const deltaContent = choice.delta.content;
          fullContent += deltaContent;

          console.log("收到增量内容，长度:", deltaContent.length, "累积长度:", fullContent.length);

          // 触发数据回调
          if (onData && deltaContent) {
            onData(deltaContent, fullContent);
          }
        }
      }
    } catch (parseError) {
      console.error("JSON解析失败:", parseError.message);
      console.error("原始数据:", dataText.substring(0, 200) + (dataText.length > 200 ? "..." : ""));
      // 不将JSON解析错误视为致命错误，继续处理
    }
  };

  console.log("发起智谱AI流式请求:", {
    url: config.apiUrl,
    model: requestData.model,
    messageCount: messages,
  });


  // 创建任务来处理流式响应 - 请求格式保持不变
  const task = wx.request({
    url: config.apiUrl,
    method: "POST",
    header: headers,
    data: requestData,
    enableChunked: true,
    responseType: "arraybuffer", // 根据博客，微信小程序返回ArrayBuffer
    success: (res) => {
      console.log("请求完成 - 状态码:", res.statusCode);

      // 检查HTTP状态码
      if (res.statusCode !== 200) {
        console.error("HTTP请求失败:", res.statusCode);
        if (onError && !hasCompleteCalled) {
          hasCompleteCalled = true;
          onError({
            errorCode: res.statusCode,
            errorMsg: `HTTP请求失败: ${res.statusCode}`,
          });
        }
        return;
      }

      // 使用chunk-res处理最后的数据
      const lastResTexts = chunkRes.onComplateReturn();
      if (lastResTexts && lastResTexts.length > 0) {
        console.log("success中处理最后数据段，数量:", lastResTexts.length);
        lastResTexts.forEach((text) => {
          processSseData(text);
        });
      }

      // 确保完成回调被触发
      if (!hasCompleteCalled) {
        hasCompleteCalled = true;
        if (fullContent) {
          console.log("success中触发完成回调，内容长度:", fullContent.length);
          if (onComplete) onComplete(fullContent);
        } else {
          console.log("success中无有效响应，触发错误回调");
          if (onError) {
            onError({
              errorCode: "NO_CONTENT",
              errorMsg: "请求完成但未收到有效响应内容",
            });
          }
        }
      }
    },
    fail: (err) => {
      console.error("请求失败:", err);
      if (onError && !hasCompleteCalled) {
        hasCompleteCalled = true;
        onError({
          errorCode: "NETWORK_ERROR",
          errorMsg: err.errMsg || "网络请求失败",
        });
      }
    },
  });

  // 使用chunk-res处理onChunkReceived
  task.onChunkReceived((res) => {
    try {
      console.log("收到chunk，响应状态:", res.statusCode);
      
      // 使用chunk-res处理分段数据
      const resTexts = chunkRes.onChunkReceivedReturn(res.data);
      
      if (resTexts && resTexts.length > 0) {
        console.log("chunk中处理数据段，数量:", resTexts.length);
        // 处理每个完整的数据段
        resTexts.forEach((text) => {
          processSseData(text);
        });
      }
    } catch (error) {
      console.error("chunk处理异常:", error);
      if (onError && !hasCompleteCalled) {
        hasCompleteCalled = true;
        onError({
          errorCode: "CHUNK_PROCESS_ERROR",
          errorMsg: "数据处理异常: " + error.message,
          details: error,
        });
      }
    }
  });

  // 格式化任务ID输出
  const formattedTaskId = {
    uniqueId: Date.now() + Math.floor(Math.random() * 10000),
    taskInvoker: "zhipuAI", 
    requestId: task,
  };
  console.log("智谱AI任务ID:", formattedTaskId);
  return formattedTaskId;
}

module.exports = {
  callZhipuAI,
  callZhipuAINonStream,
  callZhipuAIStream,
};
