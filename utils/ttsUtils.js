/**
 * 文字转语音工具函数
 * 用于处理长文本的分片、批量调用和音频合成
 */

/**
 * 将长文本分片，每段40字
 * @param {string} text - 要分片的文本
 * @param {number} chunkSize - 每段字数，默认40
 * @returns {string[]} 分片后的文本数组
 */
function splitTextIntoChunks(text, chunkSize = 40) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  return chunks;
}

/**
 * 批量调用文字转语音接口
 * @param {string[]} textChunks - 文本分片数组
 * @param {Object} options - 配置选项
 * @param {string} options.lang - 语言设置，默认'zh_CN'
 * @param {Function} options.onProgress - 进度回调函数
 * @param {Function} options.onSuccess - 成功回调函数
 * @param {Function} options.onError - 错误回调函数
 */
function batchTextToSpeech(textChunks, options = {}) {
  const {
    lang = 'zh_CN',
    onProgress,
    onSuccess,
    onError
  } = options;

  return new Promise((resolve, reject) => {
    const audioFiles = [];
    let currentIndex = 0;

    function processNextChunk() {
      if (currentIndex >= textChunks.length) {
        // 所有分片处理完成
        if (onSuccess) {
          onSuccess(audioFiles);
        }
        resolve(audioFiles);
        return;
      }

      const chunk = textChunks[currentIndex];

      // 显示处理进度
      if (onProgress) {
        onProgress({
          current: currentIndex + 1,
          total: textChunks.length,
          text: chunk
        });
      }

      // 调用文字转语音接口
      const plugin = requirePlugin('WechatSI');
      plugin.textToSpeech({
        lang: lang,
        tts: true,
        content: chunk,
        success: (res) => {
          console.log(`语音合成成功 (${currentIndex + 1}/${textChunks.length}):`, res.filename);
          audioFiles.push({
            filename: res.filename,
            text: chunk,
            index: currentIndex
          });

          currentIndex++;
          // 减少延迟时间，从500ms改为100ms
          setTimeout(processNextChunk, 100);
        },
        fail: (error) => {
          console.error(`语音合成失败 (${currentIndex + 1}/${textChunks.length}):`, error);
          if (onError) {
            onError(error, currentIndex, chunk);
          }
          reject(error);
        }
      });
    }

    // 开始处理第一个分片
    processNextChunk();
  });
}

/**
 * 将多个音频文件合成为一个连续的音频流
 * @param {Array} audioFiles - 音频文件数组，每个元素包含filename
 * @returns {Promise<string>} 返回合并后的音频文件路径
 */
function mergeAudioFiles(audioFiles) {
  return new Promise((resolve, reject) => {
    if (!audioFiles || audioFiles.length === 0) {
      reject(new Error('没有音频文件需要合并'));
      return;
    }

    if (audioFiles.length === 1) {
      // 只有一个文件，直接返回
      resolve(audioFiles[0].filename);
      return;
    }

    // 对于多个音频文件，我们需要依次播放
    // 这里返回第一个文件的路径，播放逻辑在调用方处理
    resolve(audioFiles[0].filename);
  });
}

/**
 * 播放音频文件列表（依次播放，优化衔接）
 * @param {Array} audioFiles - 音频文件数组
 * @param {Object} options - 播放选项
 * @param {Function} options.onPlayStart - 开始播放回调
 * @param {Function} options.onPlayEnd - 播放结束回调
 * @param {Function} options.onError - 播放错误回调
 */
function playAudioSequence(audioFiles, options = {}) {
  const {
    onPlayStart,
    onPlayEnd,
    onError
  } = options;

  if (!audioFiles || audioFiles.length === 0) {
    if (onError) {
      onError(new Error('没有音频文件'));
    }
    return;
  }

  let currentIndex = 0;
  let currentAudioContext = null;
  let nextAudioContext = null;

  function preloadNext() {
    if (currentIndex + 1 < audioFiles.length) {
      const nextAudioFile = audioFiles[currentIndex + 1];
      nextAudioContext = wx.createInnerAudioContext();
      nextAudioContext.src = nextAudioFile.filename;
      // 预加载音频，但不播放
      nextAudioContext.autoplay = false;
      // 监听canplay事件，确保音频已准备好
      nextAudioContext.onCanplay(() => {
        console.log(`第${currentIndex + 2}段音频预加载完成`);
      });
    }
  }

  function playNext() {
    if (currentIndex >= audioFiles.length) {
      if (onPlayEnd) {
        onPlayEnd();
      }
      return;
    }

    const audioFile = audioFiles[currentIndex];

    // 销毁之前的音频上下文
    if (currentAudioContext) {
      currentAudioContext.destroy();
    }

    // 使用预加载的音频上下文（如果有）
    if (nextAudioContext && currentIndex > 0) {
      currentAudioContext = nextAudioContext;
      nextAudioContext = null;
    } else {
      currentAudioContext = wx.createInnerAudioContext();
      currentAudioContext.src = audioFile.filename;
    }

    // 开始播放
    currentAudioContext.play();

    if (onPlayStart) {
      onPlayStart(audioFile, currentIndex);
    }

    // 立即预加载下一段音频（在当前段开始播放后）
    preloadNext();

    // 监听播放结束
    currentAudioContext.onEnded(() => {
      currentIndex++;
      // 立即播放下一段，无延迟
      playNext();
    });

    // 监听播放错误
    currentAudioContext.onError((error) => {
      console.error('音频播放错误:', error);
      if (onError) {
        onError(error, audioFile, currentIndex);
      }
      // 即使出错也继续播放下一段
      currentIndex++;
      playNext();
    });
  }

  // 开始播放第一段
  playNext();

  // 立即预加载第二段音频（如果有）
  if (audioFiles.length > 1) {
    setTimeout(() => {
      preloadNext();
    }, 100); // 短暂延迟后开始预加载
  }
  playNext();
}

/**
 * 流式文字转语音（边处理边播放）
 * @param {string} text - 要转换的文本
 * @param {Object} options - 配置选项
 * @param {string} options.lang - 语言设置，默认'zh_CN'
 * @param {number} options.chunkSize - 分片大小，默认150
 * @param {Function} options.onProgress - 处理进度回调
 * @param {Function} options.onStart - 开始回调
 * @param {Function} options.onComplete - 完成回调
 * @param {Function} options.onError - 错误回调
 */
function textToSpeechWithStreaming(text, options = {}) {
  const {
    lang = 'zh_CN',
    chunkSize = 50,
    onProgress,
    onStart,
    onComplete,
    onError
  } = options;

  return new Promise((resolve, reject) => {
    // 1. 分片处理
    const textChunks = splitTextIntoChunks(text, chunkSize);

    if (textChunks.length === 0) {
      const error = new Error('文本为空或无效');
      if (onError) onError(error);
      reject(error);
      return;
    }

    if (onStart) {
      onStart(textChunks.length);
    }

    const audioFiles = [];
    let processingIndex = 0;
    let playingIndex = 0;
    let isPlaying = false;
    let currentAudioContext = null;
    let hasError = false;

    // 播放下一段音频
    function playNextAudio() {
      if (hasError || playingIndex >= audioFiles.length) {
        return;
      }

      // 如果没有音频文件可播放，等待
      if (playingIndex >= audioFiles.length) {
        isPlaying = false;
        return;
      }

      isPlaying = true;
      const audioFile = audioFiles[playingIndex];

      // 销毁之前的音频上下文
      if (currentAudioContext) {
        currentAudioContext.destroy();
      }

      currentAudioContext = wx.createInnerAudioContext();
      currentAudioContext.src = audioFile.filename;

      console.log(`开始播放第${playingIndex + 1}段:`, audioFile.text);

      currentAudioContext.play();

      currentAudioContext.onEnded(() => {
        playingIndex++;
        // 检查是否还有更多音频需要播放
        if (playingIndex < audioFiles.length) {
          playNextAudio();
        } else if (processingIndex >= textChunks.length) {
          // 所有处理和播放都完成
          isPlaying = false;
          if (onComplete) {
            onComplete(audioFiles);
          }
          resolve(audioFiles);
        } else {
          // 等待更多音频文件
          isPlaying = false;
        }
      });

      currentAudioContext.onError((error) => {
        console.error(`第${playingIndex + 1}段播放失败:`, error);
        hasError = true;
        if (onError) {
          onError(error, audioFile, playingIndex);
        }
        reject(error);
      });
    }

    // 处理下一段文本
    function processNextChunk() {
      if (hasError || processingIndex >= textChunks.length) {
        return;
      }

      const chunk = textChunks[processingIndex];

      // 显示处理进度
      if (onProgress) {
        onProgress({
          current: processingIndex + 1,
          total: textChunks.length,
          text: chunk
        });
      }

      // 调用文字转语音接口
      const plugin = requirePlugin('WechatSI');
      plugin.textToSpeech({
        lang: lang,
        tts: true,
        content: chunk,
        success: (res) => {
          console.log(`语音合成成功 (${processingIndex + 1}/${textChunks.length}):`, res.filename);

          const audioFile = {
            filename: res.filename,
            text: chunk,
            index: processingIndex
          };

          audioFiles.push(audioFile);

          // 如果这是第一段，或者当前没有在播放，开始播放
          if (processingIndex === 0 || !isPlaying) {
            playNextAudio();
          }

          processingIndex++;

          // 继续处理下一段（如果有）
          if (processingIndex < textChunks.length) {
            // 短暂延迟后处理下一段，给第一段播放留出时间
            setTimeout(processNextChunk, 50);
          } else {
            // 所有段落都已开始处理
            console.log('所有段落处理完成');
          }
        },
        fail: (error) => {
          console.error(`语音合成失败 (${processingIndex + 1}/${textChunks.length}):`, error);
          hasError = true;
          if (onError) {
            onError(error, processingIndex, chunk);
          }
          reject(error);
        }
      });
    }

    // 开始处理第一段
    processNextChunk();
  });
}

/**
 * 流式文字转语音（支持播放控制，第一段完成后隐藏加载界面）
 * @param {string} text - 要转换的文本
 * @param {Object} options - 配置选项
 * @param {string} options.lang - 语言设置，默认'zh_CN'
 * @param {number} options.chunkSize - 分片大小，默认150
 * @param {Function} options.onProgress - 处理进度回调
 * @param {Function} options.onStart - 开始回调
 * @param {Function} options.onFirstChunkReady - 第一段准备完成回调
 * @param {Function} options.onComplete - 完成回调
 * @param {Function} options.onError - 错误回调
 * @returns {Object} 控制接口 {pause, resume, stop, getStatus}
 */
function textToSpeechWithStreamingControl(text, options = {}) {
  const {
    lang = 'zh_CN',
    chunkSize = 150,
    onProgress,
    onStart,
    onFirstChunkReady,
    onComplete,
    onError
  } = options;

  // 1. 分片处理
  const textChunks = splitTextIntoChunks(text, chunkSize);

  if (textChunks.length === 0) {
    const error = new Error('文本为空或无效');
    if (onError) onError(error);
    // 返回空的控制对象，避免返回null
    return {
      pause: () => {},
      resume: () => {},
      stop: () => {},
      getStatus: () => ({ isPlaying: false, isPaused: false, currentIndex: 0, total: 0 })
    };
  }

  if (onStart) {
    onStart(textChunks.length);
  }

  const audioFiles = [];
  let processingIndex = 0;
  let playingIndex = 0;
  let isPlaying = false;
  let isPaused = false;
  let currentAudioContext = null;
  let hasError = false;

  // 播放下一段音频
  function playNextAudio() {
    if (hasError || isPaused || playingIndex >= audioFiles.length) {
      return;
    }

    // 如果没有音频文件可播放，等待
    if (playingIndex >= audioFiles.length) {
      isPlaying = false;
      return;
    }

    isPlaying = true;
    const audioFile = audioFiles[playingIndex];

    // 销毁之前的音频上下文
    if (currentAudioContext) {
      currentAudioContext.destroy();
    }

    currentAudioContext = wx.createInnerAudioContext();
    currentAudioContext.src = audioFile.filename;

    console.log(`开始播放第${playingIndex + 1}段:`, audioFile.text);

    currentAudioContext.play();

    currentAudioContext.onEnded(() => {
      playingIndex++;
      // 检查是否还有更多音频需要播放
      if (playingIndex < audioFiles.length) {
        playNextAudio();
      } else if (processingIndex >= textChunks.length) {
        // 所有处理和播放都完成
        isPlaying = false;
        if (onComplete) {
          onComplete(audioFiles);
        }
      } else {
        // 等待更多音频文件
        isPlaying = false;
      }
    });

    currentAudioContext.onError((error) => {
      console.error(`第${playingIndex + 1}段播放失败:`, error);
      hasError = true;
      if (onError) {
        onError(error, audioFile, playingIndex);
      }
    });
  }

  // 处理下一段文本
  function processNextChunk() {
    if (hasError || processingIndex >= textChunks.length) {
      return;
    }

    const chunk = textChunks[processingIndex];

    // 显示处理进度
    if (onProgress) {
      onProgress({
        current: processingIndex + 1,
        total: textChunks.length,
        text: chunk
      });
    }

    // 调用文字转语音接口
    const plugin = requirePlugin('WechatSI');
    plugin.textToSpeech({
      lang: lang,
      tts: true,
      content: chunk,
      success: (res) => {
        console.log(`语音合成成功 (${processingIndex + 1}/${textChunks.length}):`, res.filename);

        const audioFile = {
          filename: res.filename,
          text: chunk,
          index: processingIndex
        };

        audioFiles.push(audioFile);

        // 如果这是第一段，通知第一段准备完成
        if (processingIndex === 0 && onFirstChunkReady) {
          onFirstChunkReady(audioFile);
        }

        // 如果这是第一段，或者当前没有在播放，开始播放
        if (processingIndex === 0 || !isPlaying) {
          playNextAudio();
        }

        processingIndex++;

        // 继续处理下一段（如果有）
        if (processingIndex < textChunks.length) {
          // 短暂延迟后处理下一段，给第一段播放留出时间
          setTimeout(processNextChunk, 50);
        } else {
          // 所有段落都已开始处理
          console.log('所有段落处理完成');
        }
      },
      fail: (error) => {
        console.error(`语音合成失败 (${processingIndex + 1}/${textChunks.length}):`, error);
        hasError = true;
        if (onError) {
          onError(error, processingIndex, chunk);
        }
      }
    });
  }

  // 开始处理第一段
  processNextChunk();

  // 立即返回控制接口（异步操作会在后台继续）
  return {
    pause: () => {
      if (currentAudioContext && isPlaying && !isPaused) {
        currentAudioContext.pause();
        isPaused = true;
        isPlaying = false;
      }
    },
    resume: () => {
      if (currentAudioContext && isPaused) {
        currentAudioContext.play();
        isPaused = false;
        isPlaying = true;
      } else if (!isPlaying && !isPaused && playingIndex < audioFiles.length) {
        playNextAudio();
      }
    },
    stop: () => {
      if (currentAudioContext) {
        currentAudioContext.stop();
        currentAudioContext.destroy();
        currentAudioContext = null;
      }
      isPlaying = false;
      isPaused = false;
      playingIndex = audioFiles.length; // 停止播放
    },
    getStatus: () => ({
      isPlaying,
      isPaused,
      currentIndex: playingIndex,
      total: audioFiles.length
    })
  };
}

/**
 * 完整的文字转语音流程（分片 + 批量处理 + 依次播放）
 * @param {string} text - 要转换的文本
 * @param {Object} options - 配置选项
 * @param {string} options.lang - 语言设置，默认'zh_CN'
 * @param {number} options.chunkSize - 分片大小，默认150
 * @param {Function} options.onProgress - 处理进度回调
 * @param {Function} options.onStart - 开始回调
 * @param {Function} options.onComplete - 完成回调
 * @param {Function} options.onError - 错误回调
 */
function textToSpeechWithChunking(text, options = {}) {
  const {
    lang = 'zh_CN',
    chunkSize = 50,
    onProgress,
    onStart,
    onComplete,
    onError
  } = options;

  return new Promise((resolve, reject) => {
    // 1. 分片处理
    const textChunks = splitTextIntoChunks(text, chunkSize);

    if (textChunks.length === 0) {
      const error = new Error('文本为空或无效');
      if (onError) onError(error);
      reject(error);
      return;
    }

    if (onStart) {
      onStart(textChunks.length);
    }

    // 2. 批量调用文字转语音
    batchTextToSpeech(textChunks, {
      lang,
      onProgress: (progress) => {
        if (onProgress) {
          onProgress(progress);
        }
      },
      onSuccess: (audioFiles) => {
        // 3. 依次播放音频
        playAudioSequence(audioFiles, {
          onPlayStart: (audioFile, index) => {
            console.log(`开始播放第${index + 1}段:`, audioFile.text);
          },
          onPlayEnd: () => {
            console.log('所有音频播放完成');
            if (onComplete) {
              onComplete(audioFiles);
            }
            resolve(audioFiles);
          },
          onError: (error, audioFile, index) => {
            console.error(`第${index + 1}段播放失败:`, error);
            if (onError) {
              onError(error, audioFile, index);
            }
            reject(error);
          }
        });
      },
      onError: (error) => {
        if (onError) {
          onError(error);
        }
        reject(error);
      }
    });
  });
}

module.exports = {
  splitTextIntoChunks,
  batchTextToSpeech,
  mergeAudioFiles,
  playAudioSequence,
  textToSpeechWithChunking,
  textToSpeechWithStreaming,
  textToSpeechWithStreamingControl
};
