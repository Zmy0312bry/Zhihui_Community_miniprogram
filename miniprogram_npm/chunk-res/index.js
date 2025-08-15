module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1755221878255, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./chunkRes');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });

}, function(modId) {var map = {"./chunkRes":1755221878256}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1755221878256, function(require, module, exports) {
/**
 * 微信http流式响应处理
 * ```
 * // Example:
 * const chunkRes = ChunkRes()
 * // can`t use ref() to save task; it will lost task info
 * const task = wx.request({
 *  //...other params
 *  enableChunked: true,
 *  success: (res) => {
 *    const lastResTexts:string[] | undefined = chunkRes.onComplateReturn()
 *    // dosomething
 *   }
 * })
 * task.onChunkReceived(res => {
 *   const resTexts:string[] | undefined = chunkRes.onChunkReceivedReturn(res)
 *   // dosomething
 * })
 * ```
 * @returns
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var ChunkRes = exports.ChunkRes = () => {
    /**
     * 分段返回开始
     */
    const CHUNK_START = 'data:';
    /**
     * 分段返回中断
     */
    const SPLIT_WORD = '\ndata:';
    /**
     * 保存返回文本
     */
    let lastText = '';
    /**
     * 保存解码异常的数据
     */
    let lastData = new Uint8Array();
    /**
     * 返回数据转文本
     * @param res
     * @returns
     */
    const getChunkText = (data) => {
        // let data = res.data;
        // console.log('getSeeResData:', data)
        // 兼容处理,真机返回的的是 ArrayBuffer
        if (data instanceof ArrayBuffer) {
            data = new Uint8Array(data);
        }
        let text = data;
        // Uint8Array转码
        if (typeof data != 'string') {
            // 兼容处理  微信小程序不支持TextEncoder/TextDecoder
            try {
                console.log('lastData', lastData);
                text = decodeURIComponent(escape(String.fromCharCode(...lastData, ...data)));
                lastData = new Uint8Array();
            }
            catch (error) {
                text = '';
                console.log('解码异常', data);
                // Uint8Array 拼接
                let swap = new Uint8Array(lastData.length + data.length);
                swap.set(lastData, 0);
                swap.set(data, lastData.length);
                // lastData = lastData.concat(data)
                lastData = swap;
            }
        }
        return text;
    };
    /**
     * 判断是否被拆分
     * @param text
     * @returns
     */
    const isStartString = (text) => {
        return text.substring(0, 5) == CHUNK_START;
    };
    /**
     * 对被合并的多段请求拆分
     * @param text
     */
    const splitText = (text) => {
        return text
            .replaceAll(`\n\n${SPLIT_WORD}`, `\n${SPLIT_WORD}`)
            .replaceAll(`\n${SPLIT_WORD}`, `${SPLIT_WORD}`)
            .split(SPLIT_WORD)
            .filter((str) => !!str);
    };
    /**
     * 返回数据集
     * @param res
     * @param onSuccess
     */
    const onChunkReceived = (res, onSuccess) => {
        let text = getChunkText(res);
        console.log('onChunkReceived', text);
        if (isStartString(text) && lastText) {
            console.log('onSuccess', lastText);
            onSuccess(splitText(removeStartText(lastText)));
            // 存储本次的数据
            lastText = text;
        }
        else {
            lastText = lastText + text;
        }
    };
    /**
     * 返回数据集(返回数据)
     * @param res
     * @param onSuccess
     */
    const onChunkReceivedReturn = function (res) {
        let text = getChunkText(res);
        console.log('onChunkReceived', text);
        if (isStartString(text) && lastText) {
            // console.log("onSuccess", lastText);
            // onSuccess();
            let swap = lastText;
            // 存储本次的数据
            lastText = text;
            return splitText(removeStartText(swap));
        }
        else {
            lastText = lastText + text;
        }
    };
    /**
     * 删除文本的开始的 data:
     * @param text
     * @returns
     */
    const removeStartText = (text) => {
        if (text.substring(0, CHUNK_START.length) == CHUNK_START) {
            return text.substring(CHUNK_START.length);
        }
        return text;
    };
    /**
     * 请求完成调用一下
     * @param onSuccess
     */
    const onComplate = (onSuccess) => {
        if (lastText) {
            onSuccess(splitText(removeStartText(lastText)));
            lastText = '';
        }
    };
    /**
     * 请求完成调用一下(返回数据)
     * @param onSuccess
     */
    const onComplateReturn = () => {
        if (lastText) {
            let swap = lastText;
            lastText = '';
            return splitText(removeStartText(swap));
        }
    };
    return {
        getChunkText,
        onChunkReceived,
        onChunkReceivedReturn,
        onComplateReturn,
        onComplate
    };
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1755221878255);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map