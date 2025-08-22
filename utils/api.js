let App = getApp();
let baseUrl = App.globalData.baseApiUrl || App.globalData.config.baseUrl
const {getRequestOpen,getRequest} = require('./request');

//微信login
const wxlogin_url = baseUrl + 'user/wx-login/'
// 登录状态校验
const check_login_status_url = baseUrl + 'user/wx-login/'
// 获取用户信息
const userInfo_url = baseUrl + 'user/profile/'


module.exports={
    wxlogin_url : wxlogin_url,
    check_login_status_url: check_login_status_url,
    getRequestOpen: getRequestOpen,
    getRequest: getRequest,
    userInfo_url: userInfo_url
}
