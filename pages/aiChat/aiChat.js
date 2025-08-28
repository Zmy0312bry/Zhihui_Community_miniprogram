// pages/aiChat/aiChat.js
const app = getApp();
const api = require('../../utils/api.js');
const dashScopeAI = require('../../utils/dashScopeAI.js'); // 导入dashScopeAI模块
const { 
  initRecorderManager, 
  startRecording, 
  stopRecording, 
  recognizeVoice, 
  getInputAreaHeight,
  getErrorMessage 
} = require('../../utils/voiceUtils.js');
const { 
  adjustTextareaHeight, 
  copyToClipboard
} = require('../../utils/chatUtils.js');
const {
  textToSpeechWithStreaming,
  textToSpeechWithStreamingControl
} = require('../../utils/ttsUtils.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        app: app, // 添加app对象到data中，用于在wxml中访问app.getMediaUrl
        dialogueId: 0,
        dialogue_list: [], // 保留占位符数据
        open: false,
        answer_loading: false,
        answerDesc: '',
        typePage: 'AI助手',
        title: '',
        loading: false,
        scrollTop: 0,
        beginTitle: '您好，欢迎使用上地街道小e智能AI助手',
        beginTips: '我是小e助手，我可以随时为您解答问题，提供帮助🌷',
        beginList: [
            {id: 1, tips: '上地街道有哪些卫生服务站？'},
            {id: 2, tips: '申请家庭养老床位照护有哪些步骤？'},
            {id: 3, tips: '有哪些卫生服务站提供中医服务？'},
            {id: 4, tips: '什么样的人群可以申请家庭养老床位照护？'},
        ],
        chatList: [],
        isTyping: false, // 是否正在显示消息
        typingContent: '', // 当前正在显示的消息内容
        isThisChatOver: true, // 本轮对话是否结束
        textareaHeight: 60, // 文本区域高度，默认高度
        inputAreaHeight: 170, // 整个输入区域的高度，固定为170px
        isInputExpanded: false, // 输入框是否展开（用于控制点击外部收起）
        // 语音输入相关
        inputMode: 'voice', // 默认语音输入模式：'voice' | 'text'
        isRecording: false, // 是否正在录音
        isVoiceButtonPressed: false, // 语音按钮是否被按住
        voiceText: '', // 语音识别的文字
        recorderManager: null, // 录音管理器
        // DashScope AI相关数据
        dashScopeRequestId: null, // DashScope API请求ID
        // 文字转语音相关
        ttsLoading: false, // 是否正在进行文字转语音
        ttsLoadingText: '正在准备语音...', // 加载提示文字
        ttsProgress: 0, // 加载进度百分比
        // 语音播放状态
        currentPlayingContent: '', // 当前正在播放的内容
        currentAudioContext: null, // 当前音频上下文
        audioFiles: [], // 音频文件队列
        currentPlayingIndex: -1, // 当前播放的音频索引
        currentTTSControl: null, // 当前TTS控制接口
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        // 初始化消息队列和流式输出所需变量
        // 预先生成所有需要的完整媒体URL，包含时间戳，避免在模板中拼接
        const timestamp = Date.now();
        const icowwnUrl = app.getMediaUrl('icowwn.png') + '?v=' + timestamp;
        const copyUrl = app.getMediaUrl('copy.svg');
        const defaultUrl = app.getMediaUrl('default.png');
        
        this.setData({
            app: app, // 确保app对象可在wxml中访问
            timestamp: timestamp, // 添加时间戳以刷新图片缓存
            mediaUrls: {
                icowwn: icowwnUrl,
                copy: copyUrl,
                default: defaultUrl
            },
            newMessageQueue: [],
            aiResponseContent: '', // 初始化流式输出内容
            textareaHeight: 60, // 文本区域初始高度
            inputAreaHeight: 100, // 收起状态的高度，展开时为170px
            isInputExpanded: false, // 初始状态为收起
        });
        
        // 初始化语音功能
        this.initVoiceFeatures();
    },

    // 初始化语音功能
    initVoiceFeatures() {
        const recorderManager = initRecorderManager({
            onStart: (res) => {
                console.log('录音识别开始:', res);
                this.setData({
                    isRecording: true
                });
                wx.showToast({
                    title: '正在录音...',
                    icon: 'none',
                    duration: 30000
                });
            },
            onStop: (res) => {
                console.log('录音识别结束:', res);
                this.setData({
                    isRecording: false,
                    isVoiceButtonPressed: false // 清除按住状态
                });
                wx.hideToast();
                
                // WechatSI插件直接返回识别结果
                if (res.result) {
                    console.log('识别结果:', res.result);
                    
                    // 自动切换到文字模式并将识别结果填入文字输入框
                    this.setData({
                        inputMode: 'text',  // 切换到文字模式
                        title: res.result,  // 将识别结果填入文字输入框
                        voiceText: '',      // 清空语音文字显示
                        inputAreaHeight: 170,
                        isInputExpanded: true  // 确保输入框展开状态
                    });
                    this.updateAddButtonPosition(170);
                    
                    wx.showToast({
                        title: '识别成功，已切换到文字模式',
                        icon: 'success',
                        duration: 2000
                    });
                } else {
                    console.warn('未获取到识别结果');
                    wx.showToast({
                        title: '识别失败，请重试',
                        icon: 'none'
                    });
                }
            },
            onError: (res) => {
                console.error('录音识别错误:', res);
                this.setData({
                    isRecording: false,
                    isVoiceButtonPressed: false // 清除按住状态
                });
                wx.hideToast();
                
                const errorMsg = getErrorMessage(res.retcode) || res.msg || '录音识别失败';
                wx.showToast({
                    title: errorMsg,
                    icon: 'none',
                    duration: 2000
                });
            }
        });

        this.setData({
            recorderManager: recorderManager
        });
    },

    // 切换到语音输入
    switchToVoice() {
        this.setData({
            inputMode: 'voice',
            inputAreaHeight: 170, // 保持固定高度
            isInputExpanded: true // 切换时展开输入框
        });
        this.updateAddButtonPosition(170);
    },

    // 切换到文字输入
    switchToText() {
        this.setData({
            inputMode: 'text',
            inputAreaHeight: 170, // 保持固定高度
            isInputExpanded: true // 切换时展开输入框
        });
        this.updateAddButtonPosition(170);
    },

    // 更新新增按钮位置
    updateAddButtonPosition(inputAreaHeight) {
        // 这里可以通过setData更新按钮位置，但由于WXML中已经绑定了动态计算
        // 按钮位置会自动跟随inputAreaHeight变化
        console.log('输入区域高度更新为:', inputAreaHeight);
    },

    // 展开输入框
    expandInput() {
        this.setData({
            isInputExpanded: true,
            inputAreaHeight: 170 // 展开时的高度
        });
    },

    // 收起输入框
    collapseInput() {
        this.setData({
            isInputExpanded: false,
            inputAreaHeight: 120, // 收起时的高度
            voiceText: '', // 清空语音文字
            title: '' // 清空文字输入
        });
    },

    // 点击输入区域外部收起输入框
    onClickOutside() {
        if (this.data.isInputExpanded) {
            this.collapseInput();
        }
    },

    // 点击输入区域内部，使用catchtap阻止事件冒泡
    onClickInside(e) {
        if (!this.data.isInputExpanded) {
            this.expandInput();
        }
    },

    // 开始语音录音（触摸开始）
    startVoiceRecording() {
        if (this.data.isRecording) {
            return; // 如果已经在录音中，忽略
        }
        
        // 设置按钮按住状态
        this.setData({
            isVoiceButtonPressed: true
        });
        
        // 开始录音识别，配置最大30秒，中文识别
        startRecording(this.data.recorderManager, {
            duration: 30000,
            lang: 'zh_CN',
            onError: (error) => {
                console.error('启动录音识别失败:', error);
                this.setData({
                    isRecording: false,
                    isVoiceButtonPressed: false
                });
                wx.hideToast();
                wx.showToast({
                    title: '启动录音失败',
                    icon: 'none'
                });
            }
        });
    },

    // 停止语音录音（触摸结束）
    stopVoiceRecording() {
        if (!this.data.isRecording) {
            return; // 如果没有在录音中，忽略
        }
        
        // 清除按钮按住状态
        this.setData({
            isVoiceButtonPressed: false
        });
        
        // 停止录音识别
        stopRecording(this.data.recorderManager);
    },

    // 取消语音录音（触摸取消）
    cancelVoiceRecording() {
        if (!this.data.isRecording) {
            return; // 如果没有在录音中，忽略
        }
        
        // 清除按钮按住状态
        this.setData({
            isVoiceButtonPressed: false
        });
        
        // 停止录音识别
        stopRecording(this.data.recorderManager);
        
        // 显示取消提示
        wx.showToast({
            title: '已取消录音',
            icon: 'none',
            duration: 1500
        });
    },

    // 处理语音识别（WechatSI插件中已不需要此方法，保留用于兼容性）
    async handleVoiceRecognition(filePath) {
        // WechatSI插件中，语音识别结果直接在onStop回调中返回
        // 此方法仅用于兼容性，实际不会被调用
        console.log('使用WechatSI插件时，此方法不需要调用');
    },

    // 清除语音文字，重新录音（现在用于重新开始语音输入）
    clearVoiceText() {
        this.setData({
            voiceText: '',
            title: '',  // 同时清空文字输入框
            inputMode: 'voice',  // 切换回语音模式
            inputAreaHeight: 170
        });
        this.updateAddButtonPosition(170);
    },

    // 语音文字变化（保留兼容性，但实际不会被调用）
    onVoiceTextChange(e) {
        this.setData({
            voiceText: e.detail.value
        });
    },

    // 发送语音识别的文字（现在重定向到发送文字）
    sendVoiceText() {
        // 由于语音识别后已经切换到文字模式，这个方法重定向到sendChat
        this.sendChat();
    },
    
    /**
     * 处理流式输出和打字效果显示内容
     * 支持API流式输出和模拟打字效果两种模式
     */
    showTypingContent() {
        if (!this.data.typingContent || this.data.isTyping) {
            this.setData({
                isTyping: false,
                typingContent: '', // 清空当前内容
                isThisChatOver: true
            });
            return;
        }

        this.setData({
            isTyping: true,
        });

        // 存储当前的typingInterval到this中，方便清除
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }

        let index = 0;
        let currentMessage = this.data.answerDesc;
        this.typingInterval = setInterval(() => {
            if (index < this.data.typingContent.length) {
                this.setData({
                    answerDesc: currentMessage + this.data.typingContent.slice(0, ++index),
                });
                this.autoScroll()
            } else {
                clearInterval(this.typingInterval);
                this.typingInterval = null;
                
                // 如果有完整回复内容，则添加到聊天列表
                if (this.data.aiResponseContent) {
                    const newChatItem = {
                        role: 'assistant',
                        content: this.data.aiResponseContent,
                        time: this.formatDate(new Date())
                    };
                    const updatedChatList = this.data.chatList.concat([newChatItem]);
                    this.setData({
                        chatList: updatedChatList,
                        isTyping: false,
                        typingContent: '', // 清空当前内容，准备下一条消息
                        aiResponseContent: '', // 清空暂存的回复内容
                        isThisChatOver: true, // 标记本轮对话结束
                        answer_loading: false // 关闭加载状态
                    });
                } else {
                    this.setData({
                        isTyping: false,
                        typingContent: '', // 清空当前内容，准备下一条消息
                        isThisChatOver: true, // 标记本轮对话结束
                        answer_loading: false // 关闭加载状态
                    });
                }
                
                this.autoScroll(); // 确保滚动到底部
                // 检查是否有新的消息需要显示
                if (this.data.newMessageQueue && this.data.newMessageQueue.length > 0) {
                    const nextMessage = this.data.newMessageQueue.shift(); // 取出队列中的第一条消息
                    this.setData({
                        typingContent: nextMessage,
                    });
                    this.showTypingContent(); // 递归调用自己，显示下一条消息
                }
            }
        }, 30); // 每30毫秒显示一个字符，调整为更慢的打字速度
    },
    
    /**
     * 处理API流式输出
     * @param {string} chunk 当前文本块
     * @param {string} fullContent 累积的完整内容
     */
    handleStreamingOutput(chunk, fullContent) {
        // 更新显示内容
        this.setData({
            answerDesc: fullContent, // 只更新当前显示的内容
        });
        
        // 自动滚动
        this.autoScroll();
    },
    
    /**
     * 处理API流式输出完成
     * @param {string} fullContent 完整内容
     */
    handleStreamingComplete(fullContent) {
        if (!fullContent || fullContent.length === 0) {
            fullContent = '很抱歉，我暂时无法回答您的问题，请稍后再试。🌷';
        }
        
        // 添加AI回复到聊天列表并重置状态
        const aiReplyItem = {
            role: 'assistant',
            content: fullContent,
            time: this.formatDate(new Date()),
            ttsHintText: '点击播放语音', // 语音提示文本
            ttsIconName: 'volume-o', // 语音图标名称
            ttsHintClass: '', // 语音提示样式类
            isPlayingTTS: false // 是否正在播放该消息的语音
        };
        const updatedChatList = this.data.chatList.concat([aiReplyItem]);
        this.setData({
            answerDesc: '', // 清空临时显示
            chatList: updatedChatList,
            isTyping: false,
            typingContent: '',
            isThisChatOver: true,
            answer_loading: false
        }, () => {
            this.autoScroll();
        });
        
        // 清除定时器
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
        }
    },

    /**
     * 获取AI回复内容
     * 调用DashScope AI生成回答
     * @param {string} userInput 用户输入
     * @param {Function} onData 流式输出回调函数
     * @param {Function} onComplete 完成回调函数
     * @param {Function} onError 错误回调函数
     */
    getAIResponse(userInput, onData, onComplete, onError) {
        // 调用DashScope AI流式API
        const requestTask = dashScopeAI.callDashScopeAI(
            userInput,
            (chunk, fullContent) => {
                // 流式输出回调
                if (onData) onData(chunk, fullContent);
            },
            (fullContent) => {
                // 完成回调
                if (onComplete) onComplete(fullContent);
            },
            (error) => {
                // 错误回调
                console.error('DashScope AI调用失败:', error);

                // 尝试使用备用回复策略
                let errorResponse = this.getFallbackResponse(userInput, error);

                if (onError) onError(error);

                // 模拟流式输出错误回复
                if (onData) {
                    let index = 0;
                    const chunkSize = 3;
                    const intervalId = setInterval(() => {
                        if (index < errorResponse.length) {
                            const end = Math.min(index + chunkSize, errorResponse.length);
                            const chunk = errorResponse.substring(index, end);
                            onData(chunk, errorResponse.substring(0, end));
                            index = end;
                        } else {
                            clearInterval(intervalId);
                            if (onComplete) onComplete(errorResponse);
                        }
                    }, 50);
                } else {
                    if (onComplete) onComplete(errorResponse);
                }
            }
        );

        // 保存请求任务ID
        this.data.dashScopeRequestId = requestTask;

        // 返回空字符串，实际内容将通过回调函数处理
        return '';
    },
    
    /**
     * 获取备用回复（当API调用失败时使用）
     * @param {string} userInput 用户输入
     * @param {Object} error 错误信息
     * @returns {string} 备用回复
     */
    getFallbackResponse(userInput, error) {
        // 确保userInput是有效字符串
        if (!userInput || typeof userInput !== 'string') {
            userInput = '';
        }
        
        // 智能匹配关键词，提供相关回复
        const keywordResponses = {
            '智慧社区|社区功能|功能': '🏠 智慧社区平台主要功能包括：\n• 社区公告：及时获取重要通知\n• 物业服务：报修、投诉、建议\n• 便民服务：水电缴费、家政预约\n• 智能门禁：手机开门\n• 社区活动：线上报名参与\n\n如需详细了解，请联系社区客服：62988899',
            
            '天气|气温|降温|下雨': '🌤️ 今天北京天气变化较大，请您出门记得添加衣物。老年朋友外出时要特别注意保暖，社区门口有天气提示牌可供查看。',
            
            '活动|报名|参加': '📅 社区定期举办丰富活动：\n• 老年大学课程：书法班(每周二)、智能手机课(每周四)\n• 健康讲座：每月第一个周五\n• 文艺表演：节假日举办\n\n活动地点：社区活动中心二楼\n报名电话：62988899',
            
            '物业|服务|维修|报修': '🔧 物业服务指南：\n• 报修电话：62988899（24小时）\n• 在线报修：智慧社区APP-物业服务\n• 常见问题：水电维修、门禁卡补办、停车问题\n• 服务时间：周一至周日 8:00-18:00',
            
            '医疗|看病|医院|药房': '🏥 社区医疗资源：\n• 上地医院：周一、周三免挂号费\n• 社区卫生站：基础医疗服务\n• 同仁堂上地店：药品购买\n• 紧急情况：拨打120或社区热线62988899',
            
            '交通|公交|地铁|出行': '🚌 交通出行指南：\n• 公交站：上地南口站(447路/521路)\n• 地铁站：13号线上地站(4号口有电梯)\n• 老年卡政策：满65岁可申请公交补贴\n• 办理地点：社区服务站'
        };
        
        // 查找匹配的关键词
        for (const [keywords, response] of Object.entries(keywordResponses)) {
            const keywordArray = keywords.split('|');
            if (keywordArray.some(keyword => userInput.includes(keyword))) {
                return response + '\n\n💭 温馨提示：AI助手暂时遇到网络问题，以上是为您准备的帮助信息。';
            }
        }
        
        // 根据错误类型返回不同的回复
        let errorResponse = '';
        
        if (error && error.errorCode === 'PROXY_ERROR') {
            errorResponse = '🌐 检测到网络代理问题，AI助手暂时无法连接。请您：\n• 检查网络设置\n• 稍后重试\n• 或直接联系社区客服：62988899\n\n我们正在努力解决此问题。';
        } else if (error && error.errorCode === 'TIMEOUT') {
            errorResponse = '⏰ 网络响应超时，这可能是网络繁忙导致的。建议您：\n• 稍等片刻再试\n• 检查网络连接\n• 联系社区客服获取人工帮助：62988899';
        } else if (error && error.errorCode === 'FETCH_FAILED') {
            errorResponse = '📡 网络连接中断，AI助手暂时无法为您服务。请您：\n• 检查WiFi或数据网络连接\n• 确认网络设置正常\n• 联系社区技术支持或客服：62988899';
        } else {
            errorResponse = '🤖 AI助手暂时遇到技术问题，无法回答您的问题。您可以：\n• 稍后重新尝试\n• 联系社区客服获取人工帮助：62988899\n• 在社区APP首页查看相关信息';
        }
        
        return errorResponse + '\n\n🌷 感谢您的理解，智慧社区团队正在努力为您提供更好的服务。';
    },
    
    /**
     * 显示网络诊断结果（开发调试用）
     */
    


    

    
    /**
     * 新建对话
     */
    creatChat: function(){
        this.setData({
            chatList: [],
            answerDesc: "",
            loading: false,
            dialogueId: Date.now() // 使用时间戳作为新对话ID
        });
        
        this.cancelChat();
    },
    
    /**
     * 关闭侧边栏
     */
    cancelChat(){
        this.setData({
            open: false
        });
    },
    
    /**
     * 打开侧边栏
     */
    openAddChat: function(){
        if(this.data.open){
            this.cancelChat();
            return;
        }
        
        // 只打开侧边栏，不加载历史记录
        this.setData({
            open: true
        });
    },
    

    
    /**
     * 格式化日期
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        
        return `${year}-${month}-${day} ${hour}:${minute}`;
    },
    /**
     * 自动滚动到对话底部
     */
    autoScroll() {
        let that = this;
        setTimeout(() => {
            let query = wx.createSelectorQuery();
            // 通过class选择器定位到scorll-view
            query.select('.scroll-text').boundingClientRect(res => {
                if (res) {
                    console.log('滚动到:', res.height);
                    that.setData({
                        scrollTop: res.height * 100 // 使用足够大的值确保滚动到底部
                    });
                }
            });
            query.exec();
        }, 100); // 延迟一下以确保内容渲染完成
    },
    

    /**
     * 点击示例问题发送
     */
    beginChatSend(opts){
        this.setData({
            title: opts.currentTarget.dataset.title,
        });
        this.sendChat();
    },
    
    /**
     * 输入框失焦更新标题
     */
    bindblur(event){
        this.setData({
            title: event.detail.value,
        });
    },
    
    /**
     * 根据输入内容调整文本框高度
     */
    adjustTextareaHeight(e) {
        adjustTextareaHeight(e, this.setData.bind(this));
        // 更新底部空间区域，确保聊天内容不被输入框遮挡
        this.updateBottomSpace();
    },
    
    /**
     * 更新底部空间
     */
    updateBottomSpace() {
        // 根据输入区域高度调整底部留白
        const bottomSpace = this.data.inputAreaHeight + 70; // 额外留白，适应新的输入框位置
        const extraHeight = Math.max(0, this.data.textareaHeight - 60); // 计算额外高度
        
        // 更新底部留白高度
        const bottomSpaceElem = wx.createSelectorQuery().select('.bottom-space');
        if (bottomSpaceElem) {
            bottomSpaceElem.fields({
                computedStyle: ['height'],
            }, function(res) {
                if (res) {
                    wx.createSelectorQuery().select('.bottom-space').node(function(res) {
                        if (res && res.node) {
                            res.node.style.height = bottomSpace + 'px';
                        }
                    }).exec();
                }
            }).exec();
        }
        
        
        // 同样更新样式修复SCSS的语法错误
        wx.createSelectorQuery().selectAll('.input-textarea').fields({
            computedStyle: ['max-height'],
        }, function(res) {
            if (res && res.length) {
                wx.createSelectorQuery().selectAll('.input-textarea').node(function(result) {
                    if (result && result.node) {
                        result.node.style.maxHeight = '90px';
                    }
                }).exec();
            }
        }).exec();
    },
    
    /**
     * 发送消息
     */
    sendChat(){
        const that = this;
        
        // 检查输入是否为空
        if(!that.data.title){
            wx.showToast({
                title: '请输入内容',
                icon: 'none'
            });
            return;
        }
        
        // 检查当前对话是否结束
        if(!that.data.isThisChatOver){
            wx.showToast({
                title: '请等待AI回复完成',
                icon: 'none'
            });
            return;
        }
        
        // 如果是新对话，设置页面标题
        if(that.data.chatList.length <= 0){
            that.setData({
                typePage: '智慧社区助手',
                dialogueId: Date.now() // 生成新的对话ID
            });
        }
        
        // 添加用户消息到聊天列表
        const userMessage = {
            role: 'user',
            content: that.data.title,
            time: that.formatDate(new Date())
        };
        const updatedChatList = that.data.chatList.concat([userMessage]);
        that.setData({
            isThisChatOver: false, // 标记对话正在进行
            chatList: updatedChatList,
            answer_loading: true, // 显示AI正在回复状态
            answerDesc: '' // 清空之前的回答
        });
        
        // 清空输入框并重置高度，收起输入框
        const currentUserMessage = that.data.title;
        that.setData({
            title: '',
            textareaHeight: 60, // 重置文本框高度为初始值
            inputAreaHeight: 120, // 发送后收起输入框
            isInputExpanded: false, // 收起输入框
            voiceText: '' // 清空语音文字
        });
        
        // 更新底部空间和按钮位置
        setTimeout(() => {
            that.updateBottomSpace();
        }, 50);
        
        that.autoScroll(); // 滚动到底部
        
        // 调用DashScope AI生成回答
        setTimeout(() => {
            that.getAIResponse(
                currentUserMessage,
                (chunk, fullContent) => {
                    // 流式输出回调
                    that.handleStreamingOutput(chunk, fullContent);
                },
                (fullContent) => {
                    // 完成回调
                    that.handleStreamingComplete(fullContent);
                },
                (error) => {
                    // 错误回调
                    console.error('DashScope AI调用失败:', error);
                    wx.showToast({
                        title: '获取回答失败，请重试',
                        icon: 'none'
                    });

                    // 恢复UI状态
                    that.setData({
                        isThisChatOver: true,
                        answer_loading: false
                    });
                }
            );
        }, 800); // 模拟思考时间
    },

    /**
     * 复制聊天内容
     */
    copyChatContent(e) {
        const dataset = e.currentTarget.dataset;
        const content = dataset.content;
        copyToClipboard(content);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        // 初始化自动滚动
        setTimeout(() => {
            this.autoScroll();
            // 初始化所有UI元素位置
            this.updateBottomSpace();
        }, 300);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        // 初始化TabBar
        if (this.getTabBar) {
            this.getTabBar().init();
        }
        
        // 创建默认的欢迎消息
        if (this.data.chatList.length === 0) {
            // 检查是否是第一次打开页面
            const isFirstVisit = wx.getStorageSync('isFirstAIChatVisit') !== false;
            if (isFirstVisit) {
                // 设置标志，下次不再显示欢迎消息
                wx.setStorageSync('isFirstAIChatVisit', false);
            }
        }
        
        // 应用主题设置
        const cachedTheme = wx.getStorageSync('currentTheme');
        if (cachedTheme && app.onThemeChange) {
            app.onThemeChange(cachedTheme);
        }
    },


    
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        // 清理打字效果定时器
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
        
        // 取消可能正在进行的API请求
        if (this.data.dashScopeRequestId) {
            wx.request.abort(this.data.dashScopeRequestId);
        }
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        // 清理所有状态
        this.setData({
            isTyping: false,
            typingContent: '',
            newMessageQueue: [],
            isRecording: false
        });
        
        // 停止录音
        if (this.data.recorderManager && this.data.isRecording) {
            stopRecording(this.data.recorderManager);
        }
        
        // 清理定时器
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
        
        // 取消可能正在进行的API请求
        if (this.data.dashScopeRequestId) {
            wx.request.abort(this.data.dashScopeRequestId);
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 文字转语音播放（支持长文本分片处理和播放控制）
     */
    playTextToSpeech(e) {
        const dataset = e.currentTarget.dataset;
        const content = dataset.content;
        const index = dataset.index;

        if (!content || content.trim() === '') {
            wx.showToast({
                title: '没有可播放的内容',
                icon: 'none'
            });
            return;
        }

        // 获取当前消息
        const currentMessage = this.data.chatList[index];
        if (!currentMessage) return;

        // 如果正在播放，则暂停
        if (currentMessage.isPlayingTTS && this.data.currentPlayingContent === content) {
            this.pauseTTS(index);
            return;
        }

        // 如果暂停了，恢复播放
        if (this.currentTTSControl && this.currentTTSControl.getStatus().isPaused && this.data.currentPlayingContent === content) {
            this.resumeTTS(index);
            return;
        }

        // 开始新的播放
        this.startNewTTSPlayback(content, index);
    },

    /**
     * 开始新的TTS播放
     */
    startNewTTSPlayback(content, messageIndex) {
        // 停止之前的播放
        if (this.currentTTSControl) {
            this.currentTTSControl.stop();
            this.currentTTSControl = null;
        }

        // 重置之前播放的消息状态
        const chatList = this.data.chatList;
        chatList.forEach((item, index) => {
            if (item.isPlayingTTS) {
                item.isPlayingTTS = false;
                item.ttsHintText = '点击播放语音';
                item.ttsIconName = 'volume-o';
                item.ttsHintClass = '';
            }
        });

        // 设置当前播放消息的状态
        if (chatList[messageIndex]) {
            chatList[messageIndex].isPlayingTTS = true;
            chatList[messageIndex].ttsHintText = '播放中';
            chatList[messageIndex].ttsIconName = 'volume-o';
            chatList[messageIndex].ttsHintClass = 'playing';
        }

        // 显示自定义加载动画
        this.setData({
            ttsLoading: true,
            ttsLoadingText: '正在准备语音...',
            ttsProgress: 0,
            currentPlayingContent: content,
            currentPlayingIndex: messageIndex, // 保存当前播放消息的索引
            chatList: chatList
        });

        // 使用流式控制的长文本转语音功能
        const ttsControl = textToSpeechWithStreamingControl(content, {
            lang: 'zh_CN',
            chunkSize: 50, // 每段150字
            onStart: (totalChunks) => {
                this.setData({
                    ttsLoadingText: '正在合成语音...',
                    ttsProgress: 10
                });
            },
            onProgress: (progress) => {
                const progressPercent = Math.round((progress.current / progress.total) * 80) + 10;
                this.setData({
                    ttsLoadingText: '正在处理中...',
                    ttsProgress: progressPercent
                });
            },
            onFirstChunkReady: (audioFile) => {
                // 第一段准备完成后隐藏加载界面并更新对应消息状态
                const chatList = this.data.chatList;
                const currentIndex = this.data.currentPlayingIndex;
                
                if (chatList[currentIndex]) {
                    chatList[currentIndex].isPlayingTTS = true;
                    chatList[currentIndex].ttsHintText = '播放中';
                    chatList[currentIndex].ttsIconName = 'volume-o';
                    chatList[currentIndex].ttsHintClass = 'playing';
                }
                
                this.setData({
                    ttsLoading: false,
                    chatList: chatList
                });
                // 保存播放控制接口
                this.currentTTSControl = ttsControl;
            },
            onComplete: (audioFiles) => {
                // 更新对应消息的状态
                const chatList = this.data.chatList;
                const currentIndex = this.data.currentPlayingIndex;
                
                if (chatList[currentIndex]) {
                    chatList[currentIndex].isPlayingTTS = false;
                    chatList[currentIndex].ttsHintText = '点击播放语音';
                    chatList[currentIndex].ttsIconName = 'volume-o';
                    chatList[currentIndex].ttsHintClass = '';
                }
                
                this.setData({
                    chatList: chatList,
                    currentPlayingContent: ''
                });
                this.currentTTSControl = null;
            },
            onError: (error) => {
                // 更新对应消息的状态
                const chatList = this.data.chatList;
                const currentIndex = this.data.currentPlayingIndex;
                
                if (chatList[currentIndex]) {
                    chatList[currentIndex].isPlayingTTS = false;
                    chatList[currentIndex].ttsHintText = '点击播放语音';
                    chatList[currentIndex].ttsIconName = 'volume-o';
                    chatList[currentIndex].ttsHintClass = '';
                }
                
                this.setData({
                    ttsLoading: false,
                    chatList: chatList,
                    currentPlayingContent: ''
                });
                console.error('文字转语音失败:', error);
                wx.showToast({
                    title: '语音服务不可用',
                    icon: 'none'
                });
                this.currentTTSControl = null;
            }
        });

        // 保存播放控制接口
        this.currentTTSControl = ttsControl;

        if (!ttsControl) {
            this.setData({
                ttsLoading: false
            });
        }
    },

    /**
     * 暂停语音播放
     */
    pauseTTS(messageIndex) {
        if (this.currentTTSControl) {
            this.currentTTSControl.pause();
            
            // 更新对应消息的状态
            const chatList = this.data.chatList;
            if (chatList[messageIndex]) {
                chatList[messageIndex].isPlayingTTS = false;
                chatList[messageIndex].ttsHintText = '暂停中';
                chatList[messageIndex].ttsIconName = 'pause';
                chatList[messageIndex].ttsHintClass = 'paused';
                
                this.setData({
                    chatList: chatList
                });
            }
        }
    },

    /**
     * 继续语音播放
     */
    resumeTTS(messageIndex) {
        if (this.currentTTSControl) {
            this.currentTTSControl.resume();
            
            // 更新对应消息的状态
            const chatList = this.data.chatList;
            if (chatList[messageIndex]) {
                chatList[messageIndex].isPlayingTTS = true;
                chatList[messageIndex].ttsHintText = '播放中';
                chatList[messageIndex].ttsIconName = 'volume-o';
                chatList[messageIndex].ttsHintClass = 'playing';
                
                this.setData({
                    chatList: chatList
                });
            }
        }
    },

    /**
     * 停止语音播放
     */
    stopTTS(messageIndex) {
        if (this.currentTTSControl) {
            this.currentTTSControl.stop();
            
            // 更新对应消息的状态
            const chatList = this.data.chatList;
            if (chatList[messageIndex]) {
                chatList[messageIndex].isPlayingTTS = false;
                chatList[messageIndex].ttsHintText = '点击播放语音';
                chatList[messageIndex].ttsIconName = 'volume-o';
                chatList[messageIndex].ttsHintClass = '';
                
                this.setData({
                    chatList: chatList,
                    currentPlayingContent: ''
                });
            }
            
            this.currentTTSControl = null;
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
