// pages/report/report.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalName: '',
    desc_imgs: [],
    array_reason: ['包含大额奖项(总额超过5万元)', '虚假奖项', '诱导分享、裂变', '诈骗(要求支付钱款等)', '发起人有前序违规行为', '其他原因'],
    array_reason2: ['功能异常', '产品建议', '活动投诉','提现问题反馈'],
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log(options)
    that.setData({
      lid: options.lid || '',
      title: options.title || ''
    })
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
    app.judge_admin().then(res=>{
      that.setData({
        is_admin:res.data.is_admin
      })
    })
  },

  onGotUserInfo: function (e) {
    var that = this
    var userInfo = e.detail.userInfo
    if(e.detail.userInfo){
      app.request({
        url: 'user/set',
        method: 'post',
        data: {
          nickName: userInfo.nickName,
          gender: userInfo.gender,
          avatarUrl: userInfo.avatarUrl,
        },
      }).then(res => {
        that.setData({
          userInfo: userInfo,
          is_auth: true
        })
      })
    }
  },

  send: function(){
    var that = this
    if(!that.data.is_auth){
      return;
    }
    // 反馈结果通知
    if(app.globalData.miniName == '快点抽个奖'){
      wx.requestSubscribeMessage({
        tmplIds: ['hR5kpT7glA765rZOwMOhjTYu1vWqKQ-IvSoe56Wp-jg'],
        success(res) { }
      })
    }else{
      wx.requestSubscribeMessage({
        tmplIds:['lFhj0oj8QlEHwrnOu47Ab2Qm53H7XHoq4nBZYVZWFkg'],
        success(res) { }
      })
    }
    app.request({
      url: 'lottery/send_report',
      method: 'post',
      data: {
        reason: that.data.reason,
        other_reason: that.data.other_reason,
        lid: that.data.lid || '',
        photos: that.data.desc_imgs || []
      },
    }).then(res=>{
      if(res.err_code == 0){
        wx.showToast({
          title: '已提交~',
        })
        that.setData({
          modalName: ''
        })
      }
    })
  },

  show_report: function(e){
    this.setData({
      modalName: 'report',
      reason: e.currentTarget.dataset.reason
    })
  },

  hideModal: function(){
    this.setData({
      modalName: ''
    })
  },

  textareaAInput: function(e){
    this.setData({
      other_reason: e.detail.value
    })
  },

  DelImg(e) {
    console.log(e.currentTarget.dataset)
    var that = this
    var desc_imgs = that.data.desc_imgs
    wx.showModal({
      title: '删除照片',
      content: '确定要删除这张照片吗？',
      success: res => {
        if (res.confirm) {
          desc_imgs.splice(e.currentTarget.dataset.index, 1);
          that.setData({
            desc_imgs: desc_imgs
          })
        }
      }
    })
  },

  ChooseImage: function (e) {
    var that = this
    var length = that.data.desc_imgs.length
    wx.chooseImage({
      count: 3 - length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        var desc_imgs = that.data.desc_imgs || []
        for (var i in res.tempFilePaths) {
          wx.showLoading({
            title: '上传中~',
          })
          app.uploadImg(res.tempFilePaths[i]).then(res => {
            desc_imgs.push(res.data.url)
            wx.hideLoading()
            that.setData({
              desc_imgs: desc_imgs
            })
          })
        }
      }
    })
  },
})