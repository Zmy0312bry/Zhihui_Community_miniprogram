// pages/aiChat/aiChat.js
const app = getApp();
const api = require('../../utils/api.js');
const zhipuAI = require('../../utils/zhipuAI.js'); // 导入zhipuAI模块
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
        beginTitle: '您好，欢迎使用智慧社区AI助手',
        beginTips: '我是一名智能聊天机器人，随时为您解答问题，提供帮助',
        beginList: [
            {id: 1, tips: '请介绍一下智慧社区的概念'},
            {id: 2, tips: '如何使用智慧社区的便民服务？'},
            {id: 3, tips: '社区活动报名如何操作？'},
            {id: 4, tips: '智慧社区有哪些功能？'},
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
        voiceText: '', // 语音识别的文字
        recorderManager: null, // 录音管理器
        mockResponses: { // 模拟AI回复内容
            '请介绍一下智慧社区的概念': '智慧社区是运用物联网、云计算、人工智能等技术，为社区居民提供便捷、高效、智能的生活服务平台。它包含社区管理、便民服务、安防监控、环境监测等功能，旨在提高居民生活质量和社区管理效率。',
            '如何使用智慧社区的便民服务？': '使用智慧社区的便民服务很简单：\n1. 在首页找到"便民服务"入口\n2. 选择您需要的服务类型（如水电缴费、快递代收、维修服务等）\n3. 按提示填写相关信息\n4. 提交请求后等待服务完成\n\n您也可以在"我的服务"中查看历史记录和进度。',
            '社区活动报名如何操作？': '社区活动报名步骤：\n1. 点击首页"社区活动"模块\n2. 浏览可参与的活动列表\n3. 点击感兴趣的活动查看详情\n4. 点击"立即报名"按钮\n5. 填写报名信息并提交\n\n报名成功后，您将收到确认通知，也可在"我的活动"中查看报名状态。',
            '智慧社区有哪些功能？': '智慧社区平台主要功能包括：\n- **社区公告**：重要通知及时获取\n- **物业服务**：报修、投诉、建议等\n- **便民服务**：水电缴费、家政服务预约\n- **邻里社交**：社区论坛、兴趣小组\n- **智能门禁**：手机一键开门\n- **访客管理**：预约访客、临时通行证\n- **社区活动**：线上报名、活动提醒\n- **健康服务**：社区医疗资源对接\n\n所有服务都可以在小程序中一站式完成，让社区生活更便捷。'
        },
        // 智谱AI相关数据
        zhipuRequestId: null, // 智谱API请求ID
        conversationHistory: [], // 对话历史，用于构建API请求（保留但不使用）
        systemPrompt: `角色设定请您关注社区公告获取最新进展。🎵` // 系统提示词
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
            conversationHistory: [] // 初始化对话历史
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
                    isRecording: false
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
                    isRecording: false
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

    // 开始/停止录音
    toggleRecording() {
        if (this.data.isRecording) {
            // 停止录音识别
            stopRecording(this.data.recorderManager);
        } else {
            // 开始录音识别，配置最大30秒，中文识别
            startRecording(this.data.recorderManager, {
                duration: 30000,
                lang: 'zh_CN',
                onError: (error) => {
                    console.error('启动录音识别失败:', error);
                    this.setData({
                        isRecording: false
                    });
                    wx.hideToast();
                    wx.showToast({
                        title: '启动录音失败',
                        icon: 'none'
                    });
                }
            });
        }
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
            time: this.formatDate(new Date())
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
     * 根据用户输入匹配预设回答或调用智谱AI生成回答
     * @param {string} userInput 用户输入
     * @param {boolean} useAPI 是否使用API
     * @param {Function} onData 流式输出回调函数
     * @param {Function} onComplete 完成回调函数
     * @param {Function} onError 错误回调函数
     */
    getAIResponse(userInput, useAPI = false, onData, onComplete, onError) {
        // 检查是否有匹配的预设回答
        if (this.data.mockResponses[userInput]) {
            const response = this.data.mockResponses[userInput];
            
            // 如果设置了回调函数，以模拟流式输出的方式调用回调
            if (onData && onComplete) {
                let index = 0;
                const chunkSize = 5; // 每次发送的字符数
                const intervalId = setInterval(() => {
                    if (index < response.length) {
                        const end = Math.min(index + chunkSize, response.length);
                        const chunk = response.substring(index, end);
                        onData(chunk, response.substring(0, end));
                        index = end;
                    } else {
                        clearInterval(intervalId);
                        onComplete(response);
                    }
                }, 30);
            }
            
            return response;
        }
        
        // 如果需要使用API且不是预设回答
        if (useAPI) {
            // 构建消息历史，按照您提供的格式：user在前，system在后
            const messages = [];
            
            // 添加当前用户问题（放在前面）
            messages.push({
                role: "user",
                content: userInput
            });
            
            // 添加系统提示（放在后面）
            messages.push({
                role: "system", 
                content: this.buildSystemPrompt()
            });
            
            // 调用智谱AI流式API
            const requestTask = zhipuAI.callZhipuAIStream(
                messages,
                (chunk, fullContent) => {
                    // 流式输出回调
                    if (onData) onData(chunk, fullContent);
                },
                (fullContent) => {
                    // 完成回调
                    if (onComplete) onComplete(fullContent);
                    
                    // 不再更新对话历史
                },
                (error) => {
                    // 错误回调
                    console.error('智谱AI调用失败:', error);
                    
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
                },
                {
                    max_tokens: 500, // 限制回复长度不超过500字
                    temperature: 0.7, // 控制创意度，较高的值会使输出更多样化
                    top_p: 0.95 // 保持高概率词的输出质量
                }
            );
            
            // 保存请求任务ID
            this.data.zhipuRequestId = requestTask;
            
            // 返回空字符串，实际内容将通过回调函数处理
            return '';
        }
        
        // 如果不使用API且没有预设回答，返回通用回复
        const genericResponses = [
            `感谢您的问题"${userInput}"。作为智慧社区AI助手，我正在不断学习中。这个问题我需要进一步了解，您可以联系社区客服获取更准确的信息。🌷`,
            `您好，关于"${userInput}"，我建议您可以在智慧社区APP首页查看相关指南，或联系物业服务中心获取帮助。☕`,
            `我理解您想了解关于"${userInput}"的信息。智慧社区平台正在不断完善相关功能，请您关注社区公告获取最新进展。🎵`
        ];
        
        // 随机选择一个通用回复
        const randomIndex = Math.floor(Math.random() * genericResponses.length);
        return genericResponses[randomIndex];
    },
    
    /**
     * 获取备用回复（当API调用失败时使用）
     * @param {string} userInput 用户输入
     * @param {Object} error 错误信息
     * @returns {string} 备用回复
     */
    getFallbackResponse(userInput, error) {
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
     * 构建系统提示词，只需要基本提示，不包含对话历史
     */
    buildSystemPrompt() {
        // 直接返回基础系统提示词
        return this.data.systemPrompt;
        
        return systemPrompt;
    },
    


    

    
    /**
     * 新建对话
     */
    creatChat: function(){
        this.setData({
            chatList: [],
            answerDesc: "",
            loading: false,
            dialogueId: Date.now(), // 使用时间戳作为新对话ID
            conversationHistory: [] // 清空对话历史
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
        
        // 检查是否是预设问题，使用不同的处理方式
        const isPresetQuestion = Object.keys(that.data.mockResponses).includes(userMessage);
        
        // 设置延迟模拟AI思考时间
        setTimeout(() => {
            // 对于预设问题，使用本地回答，对于其他问题，调用API
            if (isPresetQuestion) {
                // 获取预设AI回复内容
                const aiResponse = that.getAIResponse(userMessage, false);
                
                // 设置流式输出状态，但不立即添加到chatList
                that.setData({
                    answerDesc: '',
                    typingContent: aiResponse,
                    aiResponseContent: aiResponse, // 暂存完整回复内容
                    answer_loading: true // 确保loading状态保持
                });
                
                // 启动流式输出
                that.showTypingContent();
                
                // 不再更新对话历史
            } else {
                // 对于非预设问题，调用API生成回答
                that.getAIResponse(
                    userMessage, 
                    true, // 使用API
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
                        console.error('智谱AI调用失败:', error);
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
            }
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
        if (this.data.zhipuRequestId) {
            wx.request.abort(this.data.zhipuRequestId);
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
        if (this.data.zhipuRequestId) {
            wx.request.abort(this.data.zhipuRequestId);
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
