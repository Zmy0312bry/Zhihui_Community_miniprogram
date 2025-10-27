/**
 * 全局配置
 */
const config = {
    //开发版
    'develop': {
        // DashScope配置
        dashScopeConfig: {
            apiUrl: 'https://dashscope.aliyuncs.com/api/v1/apps',
            apiKey: 'sk-949ffaf61c4541a287192a3563395679', // 替换为实际的API密钥
            appId: '34121b95972b4b0ab77b1b1365660f96', // 替换为实际的APP_ID
        }
    },
    //体验版
    'trial': {
        // DashScope配置
        dashScopeConfig: {
            apiUrl: 'https://dashscope.aliyuncs.com/api/v1/apps',
            apiKey: 'sk-949ffaf61c4541a287192a3563395679', // 替换为实际的API密钥
            appId: '34121b95972b4b0ab77b1b1365660f96', // 替换为实际的APP_ID
        }
    },
    //正式版
    'release': {
        // DashScope配置
        dashScopeConfig: {
            apiUrl: 'https://dashscope.aliyuncs.com/api/v1/apps',
            apiKey: 'sk-949ffaf61c4541a287192a3563395679', // 替换为实际的API密钥
            appId: '34121b95972b4b0ab77b1b1365660f96', // 替换为实际的APP_ID
        }
    }
}[wx.getAccountInfoSync().miniProgram.envVersion];

/**
 * 全局配置
 */
module.exports = {
    config
}
