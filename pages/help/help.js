// pages/help/help.js
const app = getApp()

// 在页面中定义插屏广告
let interstitialAd = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show_loading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log('options', options)
    var lid = ''
    var uid = ''
    var share = ''
    if (decodeURIComponent(options.scene)) {
      lid = decodeURIComponent(options.scene).split('&')[1]
      uid = decodeURIComponent(options.scene).split('&')[0]
      share = decodeURIComponent(options.scene).split('&')[2]
    }
    if(options.lid){
      lid = options.lid
      uid = options.uid
      share = '1'
    }
    if(uid == wx.getStorageSync('user_id')){
      wx.redirectTo({
        url: '../lottery/lottery?lid=' + lid,
      })
      return;
    }
    that.get_lottery(lid)

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-1bdfce3c430a8260'
      })
      interstitialAd.onLoad(() => { })
      interstitialAd.onError((err) => { })
      interstitialAd.onClose(() => { })
    }

    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }

    that.get_user()
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
    that.setData({
      help_lid: lid,
      help_uid: uid,
    })
    that.query_lottery()
  },

  get_user: function () {
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

  get_lottery: function(lid){
    var that = this
    app.request({
      url: 'lottery/get',
      method: 'post',
      data: {
        lid: lid
      },
    }).then(res=>{
      that.setData({
        show_loading: false,
        lottery_info: res.data,
      })
    })
  },

  query_lottery: function(page_index){
    var that = this
    app.request({
      url: 'lottery/query',
      method: 'post',
      data: {
        page_index: parseInt(page_index) || 0
      },
    }).then(res=>{
      if(page_index && page_index > 0){
        var lottery_list = that.data.lottery_list
      }else{
        var lottery_list = []
      }
      if(res.err_code == 0){
        wx.hideLoading()
        for(let i in res.data.list){
          lottery_list.push(res.data.list[i])
        }
        that.setData({
          lottery_list: lottery_list,
          recommend_list: res.data.recommend_list
        })
      }
    })
  },

  enter_lottery: function (e) {
    wx.redirectTo({
      url: '../lottery/lottery?lid=' + e.currentTarget.dataset.lid,
    })
  },

  onGotUserInfo: function (e) {
    var that = this
    var userInfo = e.detail.userInfo
    if(e.detail.userInfo){
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
        console.log('设置用户信息', res)
      })
    }
  },

  help: function(lid, uid){
    var that = this
    if(!that.data.is_auth){
      return;
    }
    console.log(that.data.help_uid, parseInt(that.data.help_uid))
    var uid = parseInt(that.data.help_uid)
    // return;
    app.request({
      url: 'lottery/help',
      method: 'post',
      data: {
        lid: parseInt(that.data.help_lid),
        uid: uid,
        from_uid: parseInt(wx.getStorageSync('user_id')),
      },
    }).then(res => {
      wx.showToast({
        title: '助力成功~',
      })
      setTimeout(function(){
        wx.redirectTo({
          url: '../lottery/lottery?lid=' + that.data.help_lid,
        })
      }, 1000)
    })
  },
})