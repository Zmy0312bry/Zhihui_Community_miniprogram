/**
 * DashScope AI相关API工具
 */

const app = getApp();
const ChunkRes = require('./chunkRes'); // 导入chunkRes模块用于处理流式响应
// 移除chunk-res引用，我们直接处理JSON数据

/**
 * 调用DashScope AI的对话补全API
 * 支持流式输出
 * @param {string} userInput 用户输入
 * @param {Function} onData 流式输出的数据回调
 * @param {Function} onComplete 完成回调
 * @param {Function} onError 错误回调
 * @param {Object} options 其他选项
 */
function callDashScopeAI(userInput, onData, onComplete, onError, options) {
  options = options || {};
  console.log("调用DashScope AI");

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
    if (!userInput || typeof userInput !== 'string') {
      console.error("调用DashScope AI错误: 用户输入为空或格式不正确");
      if (onError) {
        onError({
          errorCode: "INVALID_PARAMS",
          errorMsg: "用户输入为空或格式不正确",
        });
      }
      return; // 直接返回，不继续执行
    }

    // 检查配置
    const config = app.globalData.config.dashScopeConfig;
    if (!config || !config.apiKey || !config.appId || !config.apiUrl) {
      console.error("DashScope配置错误: 缺少必要的配置项", config);
      if (onError) {
        onError({
          errorCode: "CONFIG_ERROR",
          errorMsg: "DashScope配置错误: 缺少必要的配置项",
        });
      }
      return; // 直接返回，不继续执行
    }

    // 检查是否是测试配置，如果是则使用模拟数据
    if (config.apiKey === 'YOUR_DASHSCOPE_API_KEY' || config.appId === 'YOUR_APP_ID') {
      console.log("检测到测试配置，使用模拟数据");
      simulateStreamingResponse(userInput, onData, onComplete, onError);
      return;
    }

    // 重定向到流式API
    return callDashScopeAIStream(userInput, onData, onComplete, onError, options);

  } catch (err) {
    console.error("调用DashScope AI过程中发生异常:", err);
    if (onError) {
      onError({
        errorCode: "EXCEPTION",
        errorMsg: "调用过程发生异常",
        error: err,
      });
    }
    return; // 直接返回，不继续执行
  }
}

/**
 * 流式调用DashScope AI的对话补全API
 * 使用chunk-res库处理HTTP分段响应
 * @param {string} userInput 用户输入
 * @param {Function} onData 流式输出的数据回调
 * @param {Function} onComplete 完成回调
 * @param {Function} onError 错误回调
 * @param {Object} options 其他选项
 */
function callDashScopeAIStream(userInput, onData, onComplete, onError, options) {
  options = options || {};
  // 获取配置信息
  const config = app.globalData.config.dashScopeConfig;

  // 构建请求参数，按照DashScope API规范
  const requestData = {
    input: {
      prompt: userInput
    },
    parameters: {
      incremental_output: true
    },
    debug: {}
  };

  // 验证API密钥格式
  if (!config.apiKey || typeof config.apiKey !== "string") {
    console.error("DashScope API密钥格式不正确:", config.apiKey);
    if (onError) {
      onError({
        errorCode: "INVALID_API_KEY",
        errorMsg: "API密钥格式不正确",
      });
    }
    return; // 直接返回，不继续执行
  }

  // 构建请求头
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${config.apiKey}`,
    "X-DashScope-SSE": "enable"  // 启用SSE流式输出
  };

  let fullContent = "";
  let hasCompleteCalled = false;

  /**
   * 处理响应数据
   * @param {string} dataText 响应数据文本
   */
  const processResponseData = (dataText) => {
    if (!dataText || !dataText.trim()) return;

    console.log("处理响应数据:", dataText.substring(0, 100) + "...");

    try {
      // 清理数据，移除可能的SSE前缀
      let cleanData = dataText.trim();
      if (cleanData.startsWith('data: ')) {
        cleanData = cleanData.substring(6);
      }
      if (cleanData.startsWith('data:')) {
        cleanData = cleanData.substring(5);
      }

      // 如果清理后是空数据，跳过
      if (!cleanData.trim()) return;

      const jsonData = JSON.parse(cleanData);

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

      // 处理output数据
      if (jsonData.output) {
        const output = jsonData.output;

        // 检查完成原因
        if (output.finish_reason === "stop") {
          console.log("收到完成信号:", output.finish_reason);
          if (onComplete && !hasCompleteCalled) {
            hasCompleteCalled = true;
            console.log("stop信号触发完成回调，最终内容长度:", fullContent.length);
            onComplete(fullContent);
          }
          return;
        }

        // 提取增量内容
        if (output.text && typeof output.text === "string") {
          const deltaContent = output.text;
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

  // 检查网络连接状态
  wx.getNetworkType({
    success: function (res) {
      console.log("当前网络类型:", res.networkType);
      if (res.networkType === "none") {
        console.error("网络连接不可用");
        if (onError) {
          onError({
            errorCode: "NO_NETWORK",
            errorMsg: "网络连接不可用，请检查网络设置",
          });
        }
        return;
      }
    },
    fail: function () {
      console.warn("无法获取网络状态");
    }
  });

  const requestUrl = `${config.apiUrl}/${config.appId}/completion`;

  console.log("发起DashScope AI流式请求:", {
    url: requestUrl,
    headers: Object.keys(headers)
  });

  // 创建任务来处理流式响应
  const task = wx.request({
    url: requestUrl,
    method: "POST",
    header: headers,
    data: requestData,
    enableChunked: true,
    responseType: "arraybuffer",
    timeout: 60000, // 设置60秒超时
    success: (res) => {
      console.log("请求完成 - 状态码:", res.statusCode);
      console.log("响应头:", res.header);

      // 检查HTTP状态码
      if (res.statusCode !== 200) {
        console.error("HTTP请求失败:", res.statusCode, res.data);
        if (onError && !hasCompleteCalled) {
          hasCompleteCalled = true;
          onError({
            errorCode: res.statusCode,
            errorMsg: `HTTP请求失败: ${res.statusCode}`,
          });
        }
        return;
      }

      // 直接处理响应数据
      try {
        let responseText = '';
        if (res.data instanceof ArrayBuffer) {
          const uint8Array = new Uint8Array(res.data);
          // 修复UTF-8解码问题
          try {
            responseText = decodeURIComponent(escape(String.fromCharCode(...uint8Array)));
          } catch (decodeError) {
            console.warn("UTF-8解码失败，使用原始解码:", decodeError);
            responseText = String.fromCharCode(...uint8Array);
          }
        } else {
          responseText = res.data;
        }

        console.log("完整响应数据:", responseText);

        // 按行分割处理SSE数据
        const lines = responseText.split('\n');
        for (const line of lines) {
          if (line.trim() && (line.startsWith('data: ') || line.startsWith('data:'))) {
            const dataContent = line.replace(/^data:\s*/, '');
            if (dataContent.trim()) {
              processResponseData(dataContent);
            }
          }
        }
      } catch (error) {
        console.error("处理响应数据失败:", error);
        if (onError && !hasCompleteCalled) {
          hasCompleteCalled = true;
          onError({
            errorCode: "PARSE_ERROR",
            errorMsg: "解析响应数据失败",
            details: error
          });
        }
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
      console.error("网络请求失败:", err);
      console.error("错误详情:", {
        errMsg: err.errMsg,
        errno: err.errno,
        errCode: err.errCode
      });

      if (onError && !hasCompleteCalled) {
        hasCompleteCalled = true;

        // 根据错误类型提供更详细的错误信息
        let errorMsg = "网络请求失败";
        let errorCode = "NETWORK_ERROR";

        if (err.errMsg) {
          if (err.errMsg.includes("timeout")) {
            errorMsg = "请求超时，请检查网络连接";
            errorCode = "TIMEOUT";
          } else if (err.errMsg.includes("Failed to fetch")) {
            errorMsg = "网络连接失败，请检查网络设置和域名配置";
            errorCode = "FETCH_FAILED";
          } else if (err.errMsg.includes("ERR_PROXY_CONNECTION_FAILED")) {
            errorMsg = "代理连接失败，请检查网络代理设置";
            errorCode = "PROXY_ERROR";
          }
        }

        onError({
          errorCode: errorCode,
          errorMsg: errorMsg,
          originalError: err
        });
      }
    },
  });

  // 使用onChunkReceived处理流式响应
  task.onChunkReceived((res) => {
    try {
      console.log("收到chunk，响应状态:", res.statusCode);

      // 直接处理chunk数据
      let chunkText = '';
      if (res.data instanceof ArrayBuffer) {
        const uint8Array = new Uint8Array(res.data);
        // 修复UTF-8解码问题
        try {
          chunkText = decodeURIComponent(escape(String.fromCharCode(...uint8Array)));
        } catch (decodeError) {
          console.warn("UTF-8解码失败，使用原始解码:", decodeError);
          chunkText = String.fromCharCode(...uint8Array);
        }
      } else {
        chunkText = res.data;
      }

      console.log("chunk原始数据:", chunkText);

      // 按行分割处理SSE数据
      const lines = chunkText.split('\n');
      for (const line of lines) {
        if (line.trim() && (line.startsWith('data: ') || line.startsWith('data:'))) {
          const dataContent = line.replace(/^data:\s*/, '');
          if (dataContent.trim()) {
            processResponseData(dataContent);
          }
        }
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
    taskInvoker: "dashScopeAI",
    requestId: task,
  };
  console.log("DashScope AI任务ID:", formattedTaskId);
  return formattedTaskId;
}

/**
 * 模拟流式响应（用于测试）
 * @param {string} userInput 用户输入
 * @param {Function} onData 流式输出的数据回调
 * @param {Function} onComplete 完成回调
 * @param {Function} onError 错误回调
 */
function simulateStreamingResponse(userInput, onData, onComplete, onError) {
  // 模拟响应内容
  const responses = [
    "您好！我是智慧社区AI助手，很高兴为您服务。",
    "根据您的问题，我来为您详细解答。",
    "智慧社区平台拥有多种功能，可以帮助您更好地管理社区事务。",
    "如果您有其他问题，请随时询问，我会尽力帮助您。",
    "感谢您的使用，祝您生活愉快！"
  ];

  // 根据用户输入选择合适的响应
  let selectedResponse = responses[0];
  if (userInput.includes("功能") || userInput.includes("有什么")) {
    selectedResponse = responses[2];
  } else if (userInput.includes("谢谢") || userInput.includes("感谢")) {
    selectedResponse = responses[4];
  }

  // 模拟流式输出
  let index = 0;
  const chunkSize = 2; // 每次输出2个字符
  const intervalId = setInterval(() => {
    if (index < selectedResponse.length) {
      const end = Math.min(index + chunkSize, selectedResponse.length);
      const chunk = selectedResponse.substring(index, end);
      const fullContent = selectedResponse.substring(0, end);

      if (onData) {
        onData(chunk, fullContent);
      }
      index = end;
    } else {
      clearInterval(intervalId);
      if (onComplete) {
        onComplete(selectedResponse);
      }
    }
  }, 100); // 每100ms输出一次

  // 返回模拟的任务ID
  return {
    uniqueId: Date.now() + Math.floor(Math.random() * 10000),
    taskInvoker: "dashScopeAI",
    requestId: "simulated_task_" + Date.now(),
  };
}

module.exports = {
  callDashScopeAI,
  callDashScopeAIStream,
};
