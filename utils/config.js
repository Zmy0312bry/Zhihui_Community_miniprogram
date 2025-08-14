/**
 * 全局配置
 */
const config = {
    //开发版
    'develop': {
        //请求的地址
        baseUrl: 'http://localhost:8080/',
        wsUrl: 'ws://localhost:8080/ws/ma/chat/'
    },
    //体验版
    'trial': {
        //请求的地址
        baseUrl: 'https://justyh.cn/prod-api/',
        wsUrl: 'wss://justyh.cn/ws/ma/chat/'
    },
    //正式版
    'release': {
        //请求的地址
        baseUrl: 'https://justyh.cn/prod-api/',
        wsUrl: 'wss://justyh.cn/ws/ma/chat/'
    }
}[wx.getAccountInfoSync().miniProgram.envVersion];

/**
 * 全局配置
 */
module.exports = {
    config
}
