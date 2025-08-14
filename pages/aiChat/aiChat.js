// pages/aiChat/aiChat.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dialogueId: 0,
        dialogue_list: [],
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
        inputAreaHeight: 100, // 整个输入区域的高度
        mockResponses: { // 模拟AI回复内容
            '请介绍一下智慧社区的概念': '智慧社区是运用物联网、云计算、人工智能等技术，为社区居民提供便捷、高效、智能的生活服务平台。它包含社区管理、便民服务、安防监控、环境监测等功能，旨在提高居民生活质量和社区管理效率。',
            '如何使用智慧社区的便民服务？': '使用智慧社区的便民服务很简单：\n1. 在首页找到"便民服务"入口\n2. 选择您需要的服务类型（如水电缴费、快递代收、维修服务等）\n3. 按提示填写相关信息\n4. 提交请求后等待服务完成\n\n您也可以在"我的服务"中查看历史记录和进度。',
            '社区活动报名如何操作？': '社区活动报名步骤：\n1. 点击首页"社区活动"模块\n2. 浏览可参与的活动列表\n3. 点击感兴趣的活动查看详情\n4. 点击"立即报名"按钮\n5. 填写报名信息并提交\n\n报名成功后，您将收到确认通知，也可在"我的活动"中查看报名状态。',
            '智慧社区有哪些功能？': '智慧社区平台主要功能包括：\n- **社区公告**：重要通知及时获取\n- **物业服务**：报修、投诉、建议等\n- **便民服务**：水电缴费、家政服务预约\n- **邻里社交**：社区论坛、兴趣小组\n- **智能门禁**：手机一键开门\n- **访客管理**：预约访客、临时通行证\n- **社区活动**：线上报名、活动提醒\n- **健康服务**：社区医疗资源对接\n\n所有服务都可以在小程序中一站式完成，让社区生活更便捷。'
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        // 初始化消息队列和流式输出所需变量
        this.setData({
            newMessageQueue: [],
            aiResponseContent: '', // 初始化流式输出内容
            textareaHeight: 60, // 文本区域初始高度
            inputAreaHeight: 100 // 输入区域初始高度
        });
        
        // 从缓存读取历史对话
        const cachedHistory = wx.getStorageSync('aiChatHistory') || [];
        this.setData({
            dialogue_list: cachedHistory
        });
    },
    
    /**
     * 模拟打字效果显示内容
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
                    this.setData({
                        chatList: [...this.data.chatList, {
                            role: 'assistant',
                            content: this.data.aiResponseContent,
                            time: this.formatDate(new Date())
                        }],
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
        }, 30); // 每80毫秒显示一个字符，调整为更慢的打字速度
    },

    /**
     * 获取AI回复内容
     * 根据用户输入匹配预设回答或生成通用回复
     */
    getAIResponse(userInput) {
        // 检查是否有匹配的预设回答
        if (this.data.mockResponses[userInput]) {
            return this.data.mockResponses[userInput];
        }
        
        // 如果没有匹配的预设回答，返回通用回复
        const genericResponses = [
            `感谢您的问题"${userInput}"。作为智慧社区AI助手，我正在不断学习中。这个问题我需要进一步了解，您可以联系社区客服获取更准确的信息。`,
            `您好，关于"${userInput}"，我建议您可以在智慧社区APP首页查看相关指南，或联系物业服务中心获取帮助。`,
            `我理解您想了解关于"${userInput}"的信息。智慧社区平台正在不断完善相关功能，请您关注社区公告获取最新进展。`
        ];
        
        // 随机选择一个通用回复
        const randomIndex = Math.floor(Math.random() * genericResponses.length);
        return genericResponses[randomIndex];
    },
    /**
     * 打开历史对话
     */
    open_chat: function(opts){
        const that = this;
        that.setData({
            chatList: [
                {
                    role: 'user',
                    content: opts.currentTarget.dataset.title || '新对话'
                },
                {
                    role: 'assistant',
                    content: that.getAIResponse(opts.currentTarget.dataset.title)
                }
            ],
            loading: false,
            dialogueId: opts.currentTarget.dataset.id,
            open: false,
            answerDesc: '',
            answer_loading: false,
            typePage: '智慧社区助手',
        });
    },
    
    /**
     * 删除历史对话
     */
    del_chat(opts){
        const that = this;
        const dialogId = opts.currentTarget.dataset.id;
        
        // 从缓存获取历史记录
        let dialogueList = wx.getStorageSync('aiChatHistory') || [];
        
        // 过滤掉要删除的对话
        const newDialogueList = dialogueList.filter(item => 
            item.dialogueId !== dialogId
        );
        
        // 更新缓存
        wx.setStorageSync('aiChatHistory', newDialogueList);
        
        that.setData({
            dialogue_list: newDialogueList
        });
        
        // 如果删除的是当前对话，清空聊天内容
        if(that.data.dialogueId == dialogId){
            that.creatChat();
        }
        
        wx.showToast({
            title: '删除成功',
            icon: 'success'
        });
    },
    
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
        
        // 从缓存获取历史对话
        const cachedHistory = wx.getStorageSync('aiChatHistory') || [];
        
        this.setData({
            open: true,
            dialogue_list: cachedHistory
        });
        
        // 如果没有历史对话，创建示例
        if(cachedHistory.length === 0) {
            const exampleDialogues = [
                {
                    dialogueId: 1001,
                    firstContent: '智慧社区有哪些功能？',
                    createTime: this.formatDate(new Date())
                },
                {
                    dialogueId: 1002,
                    firstContent: '如何报名社区活动？',
                    createTime: this.formatDate(new Date(Date.now() - 86400000))
                }
            ];
            
            // 保存示例对话到缓存
            wx.setStorageSync('aiChatHistory', exampleDialogues);
            
            this.setData({
                dialogue_list: exampleDialogues
            });
        }
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
        let query = wx.createSelectorQuery();
        // 通过class选择器定位到scorll-view
        query.select('.scroll-text').boundingClientRect(res => {
            if (res) {
                that.setData({
                    scrollTop: res.height * 100 // 滚动到底部
                });
            }
        });
        query.exec();
    },
    
    /**
     * 保存当前对话到历史记录，仅保留最新3条
     */
    saveToHistory(content) {
        // 先从缓存获取历史记录
        let dialogueList = wx.getStorageSync('aiChatHistory') || [];
        
        // 生成新的对话ID
        const newDialogueId = this.data.dialogueId || Date.now();
        
        // 创建新的对话记录
        const newDialogue = {
            dialogueId: newDialogueId,
            firstContent: content,
            createTime: this.formatDate(new Date())
        };
        
        // 检查是否已存在该对话
        const existingIndex = dialogueList.findIndex(
            item => item.dialogueId === newDialogueId
        );
        
        if (existingIndex >= 0) {
            // 更新现有对话
            dialogueList[existingIndex] = newDialogue;
        } else {
            // 添加新对话到列表前端
            dialogueList.unshift(newDialogue);
            
            // 只保留最新的3条记录
            if (dialogueList.length > 3) {
                dialogueList = dialogueList.slice(0, 3);
            }
        }
        
        // 保存到本地存储
        wx.setStorageSync('aiChatHistory', dialogueList);
        
        this.setData({
            dialogue_list: dialogueList,
            dialogueId: newDialogueId
        });
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
        const text = e.detail.value || '';
        const lineHeight = 28; // 大约单行文本高度(rpx)
        const minHeight = 60; // 最小高度(约两行)
        const maxHeight = 90; // 最大高度(约三行)
        
        // 计算文本行数 (粗略估计，每行约20个字符)
        // 计算换行符数量
        const newlines = (text.match(/\n/g) || []).length;
        // 估算文本行数(考虑自然换行和手动换行)
        const textLines = Math.ceil(text.length / 20);
        const lines = Math.max(1, Math.min(3, Math.max(newlines + 1, textLines)));
        
        // 计算所需高度
        let height = Math.max(minHeight, Math.min(maxHeight, lines * lineHeight));
        
        // 计算整个输入区域高度 (包括padding等)
        const inputAreaHeight = height + 40; // 增加padding高度
        
        this.setData({
            textareaHeight: height,
            inputAreaHeight: inputAreaHeight
        });
        
        // 更新底部空间区域，确保聊天内容不被输入框遮挡
        // 同时更新所有相关按钮位置
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
        
        // 更新添加会话按钮位置
        const addChatBtn = wx.createSelectorQuery().select('.add-chat-btn');
        if (addChatBtn) {
            addChatBtn.fields({
                computedStyle: ['bottom'],
            }, function(res) {
                if (res) {
                    wx.createSelectorQuery().select('.add-chat-btn').node(function(res) {
                        if (res && res.node) {
                            // 根据输入框高度调整按钮位置
                            const newBottom = 330 + extraHeight; // 更新为新的基础位置
                            res.node.style.bottom = newBottom + 'rpx';
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
        that.setData({
            isThisChatOver: false, // 标记对话正在进行
            chatList: [...that.data.chatList, {
                role: 'user',
                content: that.data.title,
                time: that.formatDate(new Date())
            }],
            answer_loading: true, // 显示AI正在回复状态
            answerDesc: '' // 清空之前的回答
        });
        
        // 保存到历史对话
        that.saveToHistory(that.data.title);
        
        // 清空输入框并重置高度
        const userMessage = that.data.title;
        that.setData({
            title: '',
            textareaHeight: 60, // 重置文本框高度为初始值
            inputAreaHeight: 100 // 重置输入区域高度为初始值
        });
        
        // 更新底部空间和按钮位置
        setTimeout(() => {
            that.updateBottomSpace();
        }, 50);
        
        that.autoScroll(); // 滚动到底部
        
        // 设置延迟模拟AI思考时间
        setTimeout(() => {
            // 获取AI回复内容
            const aiResponse = that.getAIResponse(userMessage);
            
            // 设置流式输出状态，但不立即添加到chatList
            that.setData({
                answerDesc: '',
                typingContent: aiResponse,
                aiResponseContent: aiResponse, // 暂存完整回复内容
                answer_loading: true // 确保loading状态保持
            });
            
            // 启动流式输出
            that.showTypingContent();
        }, 800); // 模拟思考时间
    },

    /**
     * 复制聊天内容
     */
    copyChatContent(e) {
        const { dataset } = e.currentTarget;
        const { content } = dataset;

        wx.setClipboardData({
            data: content,
            success() {
                wx.showToast({ title: '复制成功', icon: 'success' });
            },
            fail(err) {
                console.error('Failed to copy:', err);
                wx.showToast({ title: '复制失败', icon: 'none' });
            },
        });
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
        });
        
        // 清理定时器
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
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
