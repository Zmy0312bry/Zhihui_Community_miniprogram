let App = getApp();
let baseUrl = App.globalData.baseApiUrl || App.globalData.config.baseUrl
const {getRequestOpen, getRequest, uploadRequest, putRequest} = require('./request');

//微信login
const wxlogin_url = baseUrl + 'user/wx-login/'
// 登录状态校验
const check_login_status_url = baseUrl + 'user/wx-login/'
// 获取用户信息
const userInfo_url = baseUrl + 'user/profile/'
// 修改用户信息
const updateUserInfo_url = baseUrl + 'user/profile/'


module.exports={
    wxlogin_url : wxlogin_url,
    check_login_status_url: check_login_status_url,
    getRequestOpen: getRequestOpen,
    getRequest: getRequest,
    uploadRequest: uploadRequest,
    putRequest: putRequest,
    userInfo_url: userInfo_url,
    updateUserInfo_url: updateUserInfo_url
}
