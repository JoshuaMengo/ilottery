// pages/comment/comment.js
const app = getApp()

// 在页面中定义插屏广告
let interstitialAd = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uninterested:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      lid: options.lid
    })
    that.query_comment(options.lid)
    app.judge_perm(options.lid).then(res=>{
      that.setData({
        is_admin: res.data.has_perm,
      })
    })

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-3551ca06a29b5ee5'
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
  },

  changeInterested(e){
    console.log(e)
    let val = Number(e.target.dataset.value)+1
    this.setData({
      uninterested:val
    })
  },

  query_comment: function(lid, url){
    var that = this
    app.request({
      url: 'lottery/get_comment',
      method: 'post',
      data: {
        lid: lid || that.data.lid,
        flag: 'more'
      },
    }).then(res=>{
      that.setData({
        comment_list: res.data.list
      })
    })
  },

  show_comment: function(){
    this.setData({
      modalName: 'comment'
    })
  },

  show_reply: function(e){
    this.setData({
      modalName: 'reply',
      reply_cid: e.detail
    })
  },

  cantmove: function(){
    return;
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  content_input: function(e){
    this.setData({
      content: e.detail.value
    })
  },

  reply_input: function(e){
    this.setData({
      reply_content: e.detail.value
    })
  },

  onGotUserInfo: function (e) {
    var that = this
    var userInfo = e.detail.userInfo
    console.log(userInfo)
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
        console.log('设置用户信息')
      })
    }
  },

  send_comment: function(){
    var that = this
    if(!that.data.is_auth){
      return;
    }
    if(!that.data.content){
      wx.showToast({
        title: '写点内容吧~',
      })
      return;
    }
    that.setData({
      disabled: true,
    })
    app.request({
      url: 'lottery/comment',
      method: 'post',
      data: {
        lid: that.data.lid,
        content: that.data.content,
        photos: []
      },
    }).then(res=>{
      if(res.err_code == 0){
        that.query_comment()
        that.setData({
          content: '',
          modalName: '',
          disabled: false,
        })
        wx.showToast({
          title: '留言成功待审核',
        })
      }
    })
  },

  send_reply: function(){
    var that = this
    if(!that.data.is_auth){
      return;
    }
    if(!that.data.reply_content){
      wx.showToast({
        title: '写点内容吧~',
      })
      return;
    }
    that.setData({
      disabled: true,
    })
    app.request({
      url: 'lottery/reply',
      method: 'post',
      data: {
        cid: parseInt(that.data.reply_cid),
        content: that.data.reply_content,
        photos: []
      },
    }).then(res=>{
      if(res.err_code == 0){
        that.query_comment()
        that.setData({
          reply_content: '',
          modalName: '',
          disabled: false,
        })
        wx.showToast({
          title: '回复成功待审核',
        })
      }
    })
  },
})