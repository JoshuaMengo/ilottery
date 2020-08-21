// pages/jifen/jifen.js
const app = getApp()

// 在页面中定义激励视频广告
let rewardedVideoAd = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    curtar: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    if(options.status){
      that.setData({
        curtar: options.status8  
      })
    }
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          var is_auth = false
        } else {
          var is_auth = true
        }
        that.setData({
          is_auth: is_auth
        })
      }
    })
    that.get_user()
    // 在页面onLoad回调事件中创建激励视频广告实例
    if (wx.createRewardedVideoAd) {
      rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-a32cecca86befffb'
      })
      rewardedVideoAd.onLoad(() => { })
      rewardedVideoAd.onError((err) => { })
    }
  },

  get_addr: function () {
    var that = this
    wx.chooseAddress({
      success(res) {
        app.request({
          url: 'user/update_addr',
          method: 'post',
          data: {
            realName: res.userName,
            province: res.provinceName,
            city: res.cityName,
            country: res.countyName,
            region_detail: res.detailInfo,
            phone: res.telNumber,
            wechatPhone: ''
          },
        }).then(res => {
          if (res.err_code == 0) {
            that.get_user()
            wx.showToast({
              title: '已填写保存',
            })
          }
        })
      }
    })
  },

  select_task: function(e){
    this.setData({
      curtar: e.currentTarget.dataset.curtar
    })
  },

  videoAd_btn: function(){
    // 用户触发广告后，显示激励视频广告
    wx.showLoading({
      title: '加载中~',
    })
    if (rewardedVideoAd) {
      console.log('show')
      wx.hideLoading()
      rewardedVideoAd.show().catch(() => {
        // 失败重试
        rewardedVideoAd.load()
          .then(() => rewardedVideoAd.show())
          .catch(err => {
            console.log('激励视频 广告显示失败')
          })
      })
      rewardedVideoAd.onClose((res) => {
        // 用户点击了【关闭广告】按钮
        if (res && res.isEnded) {
          var that = this
          app.request({
            url: 'user/watch',
            method: 'post',
            data: {},
          }).then(res=>{
            wx.showToast({
              title: '播放完整+50',
            })
            that.get_user()
          })
          // 正常播放结束，可以下发游戏奖励
        } else {
          wx.showToast({
            title: '未完整播放',
          })
          // 播放中途退出，不下发游戏奖励
        }
      })
    }
  },

  get_user: function(){
    var that = this
    app.request({
      url: 'user/get',
      method: 'post',
      data: {
        uid: parseInt(wx.getStorageSync('user_id'))
      },
    }).then(res => {
      that.setData({
        user_info: res.data
      })
    })
  },

  sign_in: function(){
    var that = this
    if(that.data.user_info.is_login){
      wx.showToast({
        title: '今日已签到',
      })
      return;
    }
    app.request({
      url: 'user/record_login',
      method: 'post',
      data: {},
    }).then(res=>{
      wx.showToast({
        title: '签到成功+100',
      })
      that.get_user()
    })
  },

  share_btn: function(){
    var that = this
    if (that.data.user_info.is_share){
      return;
    }
    app.request({
      url: 'lottery/share',
      method: 'post',
      data: {},
    }).then(res => {
      if (res.err_code == 0) {
        setTimeout(function () {
          wx.showToast({
            title: '幸运币+50',
          })
          that.get_user()
        }, 2000)
      }
    })
  },

  enter_log: function(){
    wx.navigateTo({
      url: '../pointlog/pointlog',
    })
  },

  onShareAppMessage: function(){
    var imageUrl = 'https://cjzs.lodidc.cn/cjzs/data/image/material/sharepic.png'
    var that = this
    return {
      title: '一个认真的抽奖小助手~',
      imageUrl: imageUrl,
      success: function (res) {
        
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onGotUserInfo: function (e) {
    var that = this
    var userInfo = e.detail.userInfo
    if (e.detail.userInfo) {
      that.setData({
        userInfo: userInfo,
        is_auth: true
      })
      app.request({
        url: 'user/set',
        method: 'post',
        data: {
          nickName: userInfo.nickName,
          gender: userInfo.gender,
          avatarUrl: userInfo.avatarUrl,
        },
      }).then(res => {
        console.log('设置用户信息')
        if(res.err_code == 0){
          wx.showToast({
            title: '授权成功',
          })
          that.get_user()
        }
      })
    }
  },

  getPhoneNumber: function (e) {
    var that = this
    var session_key = wx.getStorageSync('session_key')
    app.request({
      url: 'user/get_phone',
      method: 'post',
      data: {
        "iv": e.detail.iv,
        "encryptedData": e.detail.encryptedData,
        "session_key": session_key
      },
    }).then(res => {
      console.log('获取电话号码', res)
      if (res.err_code == 0) {
        that.setData({
          phone: res.data.phoneNumber
        })
      }
    })
  },
})