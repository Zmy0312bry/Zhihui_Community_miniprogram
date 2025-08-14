let App = getApp();
let baseUrl = App.globalData.config.baseUrl
let wsUrl = App.globalData.config.wsUrl
const {getRequestOpen,getRequest,uploadFile} = require('./request');
const {callZhipuAI, callZhipuAINonStream, callZhipuAIStream} = require('./zhipuAI');
//微信login
const wxlogin_url = baseUrl + 'open/wx/ma/login'
//微信退出登录
const wxlogout_url = baseUrl + 'wx/ma/user/logout'
const chat_url = baseUrl + 'wx/ma/chat/list'
const chatpost_url = baseUrl + 'wx/ma/chat/chat'
const dialogue_url = baseUrl + 'wx/ma/dialogue/pageList'
const dialogue_del_url = baseUrl + 'wx/ma/dialogue/del/'
const creatDialogue_url = baseUrl + 'wx/ma/dialogue'
// 获取用户信息
const userInfo_url = baseUrl + 'wx/ma/user/info'
//更新用户信息
const userUpdate_url = baseUrl + 'wx/ma/user/updateInfo'
//增加聊天次数
const addChatNums_url = baseUrl + '/wx/ma/numChange/addChatNums'

//通用上传文件接口
const upload_url = baseUrl + 'wx/ma/common/uploadLocal'


module.exports={
    wxlogin_url : wxlogin_url,
    chat_url: chat_url,
    chatpost_url: chatpost_url,
    dialogue_url: dialogue_url,
    dialogue_del_url:dialogue_del_url,
    creatDialogue_url: creatDialogue_url,
    getRequestOpen: getRequestOpen,
    getRequest: getRequest,
    uploadFile: uploadFile,
    ws_url: wsUrl,
    userInfo_url: userInfo_url,
    userUpdate_url: userUpdate_url,
    wxlogout_url: wxlogout_url,
    upload_url: upload_url,
    addChatNums_url: addChatNums_url,
    // 智谱AI相关API
    callZhipuAI: callZhipuAI,
    callZhipuAINonStream: callZhipuAINonStream, 
    callZhipuAIStream: callZhipuAIStream
}
