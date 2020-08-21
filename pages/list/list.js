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
    var that = this
    that.get_lottery(options.lid)
  },

  get_lottery: function (lid) {
    var that = this
    app.request({
      url: 'lottery/get_winning_list',
      method: 'post',
      data: {
        lid: lid
      },
    }).then(res => {
      that.setData({
        win_list: res.data.list
      })
    })
  },
})