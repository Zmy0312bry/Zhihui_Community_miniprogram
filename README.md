# 智慧社区小程序部分相关代码

代码主要是继承自[Gitee Repo](https://gitee.com/yuanhan93/ai-chat-open)并修改

## DashScope AI 配置说明

### 1. 获取API密钥和APP_ID

1. 访问 [DashScope 控制台](https://dashscope.console.aliyun.com/)
2. 登录您的阿里云账号
3. 在控制台中创建新的应用或使用现有应用
4. 获取以下信息：
   - **API Key**: 在API密钥管理页面获取
   - **APP ID**: 在应用详情页面获取

### 2. 配置小程序

编辑 `utils/config.js` 文件，将占位符替换为实际值：

```javascript
// 开发版配置
'develop': {
    dashScopeConfig: {
        apiUrl: 'https://dashscope.aliyuncs.com/api/v1/apps',
        apiKey: 'your_actual_api_key_here', // 替换为实际的API密钥
        appId: 'your_actual_app_id_here', // 替换为实际的APP_ID
    }
},
```

### 3. 测试功能

- 如果配置了真实的API密钥和APP_ID，将调用真实的DashScope API
- 如果保留占位符，将使用模拟数据进行测试
- 两种模式都支持流式输出

### 4. 功能特性

- ✅ 纯文本问答（无提示词）
- ✅ 流式输出显示
- ✅ 错误处理和重试
- ✅ 网络状态检测
- ✅ 模拟测试模式

## 注意事项

- 确保小程序的网络请求域名已配置
- API密钥请妥善保管，不要在代码中明文存储
- 生产环境建议使用正式版的配置
