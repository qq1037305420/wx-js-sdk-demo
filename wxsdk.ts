import axios from 'axios'
import wx from 'weixin-js-sdk'
import Env from './env'

interface getLocationCallback { latitude: number, longitude: number, speed: number, accuracy: number }
interface openLocationOption {
    latitude: number // 纬度，浮点数，范围为90 ~ -90
    longitude: number // 经度，浮点数，范围为180 ~ -180。
    name: string // 位置名
    address: string // 地址详情说明
}
class WXSdk {
    constructor(jsApiList = ['getLocation', 'openLocation', 'chooseImage', 'uploadImage', 'translateVoice', 'startRecord', 'stopRecord'], url = document.location) {
        axios.get(`${Env.DATA_SERVER}/weixin/signature/new?url=${url}`).then(response => {
            let data = response.data as any
            wx.config({
                debug: !Env.PRODUCTION_MODE, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: Env.WX_APP_ID, // 必填，公众号的唯一标识
                timestamp: data.timestamp, // 必填，生成签名的时间戳
                nonceStr: data.nonceStr, // 必填，生成签名的随机串
                signature: data.signature, // 必填，签名
                jsApiList: jsApiList // 必填，需要使用的JS接口列表
            })
            wx.error(res => {
                console.error(res)
            })
        })
    }
    public uploadImage(localId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.call('uploadImage', {
                localId: localId,
                isShowProgressTips: 1,
                success: function (res) {
                    resolve(res)
                }
            })
        })
    }
    public chooseImage(): Promise<any> {
        let me = this
        return new Promise((resolve, reject) => {
            me.call('chooseImage', {
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['camera'],
                success: function (res) {
                    resolve(res.localIds)
                }
            })
        })
    }
    public getLocation(): Promise<getLocationCallback> {
        return new Promise<getLocationCallback>((resolve, rejct) => {
            this.call('getLocation', {
                type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                success: function (res) {
                    resolve(res as any)
                }
            })
        })
    }
    public openLocation(params: openLocationOption): void {
        this.call('openLocation', params)
    }
    public startRecord(): void {
        this.call('startRecord')
    }
    public async stopNTranslate(): Promise<string> {
        let voiceId = await this.stopRecord()
        return await this.translateVoice(voiceId)
    }
    private stopRecord(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.call('stopRecord', {
                success: function (res) {
                    var localId = res.localId;
                    resolve(localId)
                }
            })
        })
    }
    private translateVoice(localId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.call('translateVoice', {
                localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
                isShowProgressTips: 1, // 默认为1，显示进度提示
                success: function (res) {
                    resolve(res.translateResult); // 语音识别的结果
                }
            })
        })
    }
    private call(methodName: string, methodParams?: any) {
        wx.ready(() => {
            wx[methodName].call({}, methodParams)
        })
    }
}

export default new WXSdk()
