/**
 * 微信http流式响应处理
 * 从chunk-res库移植到本地
 */

/**
 * 微信http流式响应处理
 * @returns
 */
const ChunkRes = () => {
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
     * @param data
     * @returns
     */
    const getChunkText = (data) => {
        // 兼容处理,真机返回的的是 ArrayBuffer
        if (data instanceof ArrayBuffer) {
            data = new Uint8Array(data);
        }
        let text = data;
        // Uint8Array转码
        if (typeof data != 'string') {
            // 兼容处理  微信小程序不支持TextEncoder/TextDecoder
            try {
                text = decodeURIComponent(escape(String.fromCharCode(...lastData, ...data)));
                lastData = new Uint8Array();
            } catch (error) {
                text = '';
                console.log('解码异常', data);
                // Uint8Array 拼接
                let swap = new Uint8Array(lastData.length + data.length);
                swap.set(lastData, 0);
                swap.set(data, lastData.length);
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
     * 返回数据集(返回数据)
     * @param res
     */
    const onChunkReceivedReturn = function (res) {
        let text = getChunkText(res);
        console.log('onChunkReceived', text);
        if (isStartString(text) && lastText) {
            let swap = lastText;
            // 存储本次的数据
            lastText = text;
            return splitText(removeStartText(swap));
        } else {
            lastText = lastText + text;
        }
    };

    /**
     * 完成时返回最后的数据
     * @returns
     */
    const onComplateReturn = function () {
        if (lastText) {
            return splitText(removeStartText(lastText));
        }
    };

    return {
        onChunkReceivedReturn,
        onComplateReturn
    };
};

module.exports = ChunkRes;
