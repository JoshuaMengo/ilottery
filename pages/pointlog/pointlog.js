// pages/pointlog/pointlog.js
const app = getApp()

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
    this.query_log()
  },

  query_log: function(){
    wx.showLoading({
      title: '玩命加载中',
    })
    var that = this
    app.request({
      url: 'user/get_pointlog',
      method: 'post',
      data: {},
    }).then(res => {
      wx.hideLoading()
      that.setData({
        point_log: res.data.list
      })
    })
  },
})