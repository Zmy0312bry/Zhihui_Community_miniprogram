/**
 * 全局配置
 */
const config = {
    //开发版
    'develop': {
        // DashScope配置
        dashScopeConfig: {
            apiUrl: 'https://dashscope.aliyuncs.com/api/v1/apps',
            apiKey: 'sk-7785abb1cf484e2db39b0f502297b9de', // 替换为实际的API密钥
            appId: 'f2a0a2d2d4b044c09d9c6f952bf7fa8d', // 替换为实际的APP_ID
        }
    },
    //体验版
    'trial': {
        // DashScope配置
        dashScopeConfig: {
            apiUrl: 'https://dashscope.aliyuncs.com/api/v1/apps',
            apiKey: 'sk-7785abb1cf484e2db39b0f502297b9de', // 替换为实际的API密钥
            appId: 'f2a0a2d2d4b044c09d9c6f952bf7fa8d', // 替换为实际的APP_ID
        }
    },
    //正式版
    'release': {
        // DashScope配置
        dashScopeConfig: {
            apiUrl: 'https://dashscope.aliyuncs.com/api/v1/apps',
            apiKey: 'sk-7785abb1cf484e2db39b0f502297b9de', // 替换为实际的API密钥
            appId: 'f2a0a2d2d4b044c09d9c6f952bf7fa8d', // 替换为实际的APP_ID
        }
    }
}[wx.getAccountInfoSync().miniProgram.envVersion];

/**
 * 全局配置
 */
module.exports = {
    config
}
