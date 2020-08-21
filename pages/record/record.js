// pages/record/record.js
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
    if(options.status == '1'){
      var flag = 'join'
    }
    if(options.status == '2'){
      var flag = 'create'
    }
    if(options.status == '3'){
      var flag = 'draw'
    }
    this.query_user_lottery(flag)
    this.setData({
      status: options.status
    })
  },

  more: function(e){
    var idx = e.currentTarget.dataset.idx
    this.setData({
      lottery: this.data.lottery_list[idx],
      modalName: 'RadioModal',
      fake_num: '',
      lottery_idx: idx,
    })
  },

  enter_adv: function(e){
    wx.navigateTo({
      url: '../adv/adv?lid=' + e.currentTarget.dataset.lid,
    })
    this.setData({
      modalName: ''
    })
  },

  delete_lottery: function(e){
    var that = this
    wx.showModal({
      title: '删除抽奖',
      content: '请确保活动删除不影响正在参与的用户',
      success(res){
        if(res.confirm){
          app.request({
            url: 'lottery/delete',
            method: 'post',
            data: {
              lid: e.currentTarget.dataset.lid
            },
          }).then(res => {
            wx.showToast({
              title: '操作成功',
            })
            var lottery_list = that.data.lottery_list
            lottery_list.splice(that.data.lottery_idx, 1)
            that.setData({
              lottery_list: lottery_list,
              modalName: ''
            })
          })
        }
      }
    })
  },

  export_data: function(e){
    let that = this
    app.request({
      url: 'lottery/export_data',
      method: 'post',
      data: {
        lid: parseInt(e.currentTarget.dataset.lid)
      },
    }).then(resp => {
      wx.downloadFile({
        url: resp.data.url, //仅为示例，并非真实的资源
        success(res) {
          if (res.statusCode === 200) {
            wx.openDocument({
              filePath: res.tempFilePath,
            })
          }
        }
      })
    })
  },

  query_user_lottery: function(flag){
    var that = this
    app.request({
      url: 'lottery/query_user_lottery',
      method: 'post',
      data: {
        uid: parseInt(wx.getStorageSync('user_id')),
        flag: flag
      },
    }).then(res=>{
      that.setData({
        lottery_list: res.data.list
      })
    })
  },

  enter_lottery: function(e){
    wx.navigateTo({
      url: '../lottery/lottery?lid=' + e.currentTarget.dataset.lid,
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null,
      fake_num: '',
    })
  },
})