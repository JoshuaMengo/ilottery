// pages/chat/chat.js
const backgroundAudioManager = wx.getBackgroundAudioManager()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // goBackHome回调 返回上一级页面
  goBackHome: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  tap: function(e){
    console.log(e)
  },

  // getQueryCallback回调, 返回数据
  getQueryCallback: function (e) {
  },
  // 点击机器人回答里的链接跳转webview,需要开发者自己配置一个承载webview的页面,url字段对应的小程序页面需要开发者自己创建
  // 开发者需要在小程序后台配置相应的域名
  // 1.1.7版本开始支持
  openWebview: function (e) {
    let url = e.detail.weburl
    console.log(url)
    wx.navigateTo({
      url: `../webview/webview?url=${url}`
    })
  },
  // 点击机器人回答中的小程序，需要在开发者自己的小程序内做跳转
  // 开发者需要在小程序配置中指定跳转小程序的appId
  // 1.1.7版本开始支持
  openMiniProgram(e) {
    let { appid, pagepath } = e.detail
    wx.navigateToMiniProgram({
      appId: appid,
      path: pagepath,
      extraData: {
      },
      envVersion: '',
      success(res) {
        // 打开成功
      }
    })
  }
})