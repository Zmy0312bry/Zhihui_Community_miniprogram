/**
 * 全局配置
 */
const config = {
    //开发版
    'develop': {
        // 智谱AI配置
        zhipuAIConfig: {
            apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            apiKey: '442ca48637c248b69a7c28068ee6a571.rC8wDolvNewucBgf', // 上线前替换为实际的API密钥
            model: 'glm-4.5-flash', // 默认使用的模型（按照最新版本修改）
        }
    },
    //体验版
    'trial': {
        // 智谱AI配置
        zhipuAIConfig: {
            apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            apiKey: '442ca48637c248b69a7c28068ee6a571.rC8wDolvNewucBgf', // 上线前替换为实际的API密钥
            model: 'glm-4.5-flash', // 默认使用的模型
        }
    },
    //正式版
    'release': {
        // 智谱AI配置
        zhipuAIConfig: {
            apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            apiKey: '442ca48637c248b69a7c28068ee6a571.rC8wDolvNewucBgf', // 上线前替换为实际的API密钥
            model: 'glm-4.5-flash', // 默认使用的模型
        }
    }
}[wx.getAccountInfoSync().miniProgram.envVersion];

/**
 * 全局配置
 */
module.exports = {
    config
}
