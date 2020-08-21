// pages/admin/admin.js
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_index: 0,
    modalName: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.query_lottery()
  },

  pid_input: function(e){
    this.setData({
      pid_idx: e.detail.value
    })
  },

  pid_num_input: function(e){
    this.setData({
      pid_num: e.detail.value
    })
  },

  change_prize: function(){
    let that = this
    if(!that.data.pid_idx || !that.data.pid_num){
      wx.showToast({
        title: '请设置完整',
      })
      return;
    }
    var lottery = that.data.lottery
    app.request({
      url: 'lottery/change_prize',
      method: 'post',
      data: {
        pid: parseInt(lottery.prizes[that.data.pid_idx - 1].pid),
        num: that.data.pid_num,
      },
    }).then(res=>{
      if(res.err_code == 0){
        wx.showToast({
          title: '设置成功',
        })
        that.setData({
          modalName: ''
        })
      }
    })
  },

  show_change_prize: function(){
    this.setData({
      modalName: ''
    })
    var that = this
    setTimeout(function(){
      that.setData({
        modalName: 'setting'
      })
    },500)
  },

  remark_input: function(e){
    this.setData({
      remark: e.detail.value
    })
  },

  search_lottery: function(){
    let that = this
    if(!that.data.remark){
      wx.showToast({
        title: '请输入搜索内容',
        image: '/resources/new/error.png'
      })
      return;
    }
    app.request({
      url: 'lottery/search_lottery',
      method: 'post',
      data: {
        content: that.data.remark,
      },
    }).then(res=>{
      that.setData({
        lottery_list: res.data.list
      })
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

  fake_num_input: function(e){
    this.setData({
      fake_num: e.detail.value
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null,
      fake_num: '',
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

  export_data: function (e) {
    let that = this
    app.request({
      url: 'lottery/export_data',
      method: 'post',
      data: {
        lid: parseInt(e.currentTarget.dataset.lid)
      },
    }).then(resp => {
      wx.setClipboardData({
        data: resp.data.url,
        success(res) {
          wx.getClipboardData({
            success(res) {
              wx.showToast({
                title: '已复制名单链接',
              })
            }
          })
        }
      })
      // wx.downloadFile({
      //   url: resp.data.url, //仅为示例，并非真实的资源
      //   success(res) {
      //     if (res.statusCode === 200) {
      //       that.setData({
      //         modalName: '',
      //       })
      //       wx.openDocument({
      //         filePath: res.tempFilePath,
      //       })
      //     }
      //   }
      // })
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

  get_mini_lottery: function(lid, idx){
    var that = this
    app.request({
      url: 'lottery/admin_get',
      method: 'post',
      data: {
        lid: parseInt(lid)
      },
    }).then(res=>{
      var lottery_list = that.data.lottery_list
      lottery_list[parseInt(idx)] = res.data
      that.setData({
        lottery_list: lottery_list,
        modalName: ''
      })
    })
  },

  query_lottery: function(page_index) {
    var that = this
    var page_index = page_index || that.data.page_index || 0
    app.request({
      url: 'lottery/admin_query',
      method: 'post',
      data: {
        page_index: page_index
      },
    }).then(res => {
      var lottery_list = that.data.lottery_list || []
      if (res.err_code == 0) {
        wx.hideLoading()
        for (let i in res.data.list) {
          lottery_list.push(res.data.list[i])
        }
        that.setData({
          lottery_list: lottery_list,
          modalName: '',
        })
      }
    })
  },

  enter_lottery: function(e){
    wx.navigateTo({
      url: '../lottery/lottery?lid=' + e.currentTarget.dataset.lid,
    })
  },

  recommend: function(e){
    var that = this
    app.request({
      url: 'lottery/change_recommend',
      method: 'post',
      data: {
        lid: e.currentTarget.dataset.lid
      },
    }).then(res=>{
      wx.showToast({
        title: '操作成功',
      })
      that.get_mini_lottery(e.currentTarget.dataset.lid, that.data.lottery_idx)
      // that.query_lottery()
    })
  },

  fake: function(e){
    var that = this
    console.log('lid', e.currentTarget.dataset.lid)
    if (!that.data.fake_num){
      wx.showToast({
        title: '请设置参与人数',
      })
      return;
    }
    wx.showModal({
      title: '设置参与人数',
      content: '确定设置参与人数吗，开奖后中奖名单为虚拟数据',
      success(res){
        if(res.confirm){
          app.request({
            url: 'lottery/change_fake',
            method: 'post',
            data: {
              lid: e.currentTarget.dataset.lid,
              fake_num: parseInt(that.data.fake_num),
            },
          }).then(res => {
            wx.showToast({
              title: '操作成功',
            })
            that.get_mini_lottery(e.currentTarget.dataset.lid, that.data.lottery_idx)
            // that.query_lottery()
          })
        }
      }
    })
  },

  show_index: function(e){
    var that = this
    app.request({
      url: 'lottery/change_show',
      method: 'post',
      data: {
        lid: e.currentTarget.dataset.lid
      },
    }).then(res => {
      wx.showToast({
        title: '操作成功',
      })
      that.get_mini_lottery(e.currentTarget.dataset.lid, that.data.lottery_idx)
      // that.query_lottery()
    })
  },

  onReachBottom: function () {
    var that = this;
    var page_index = that.data.page_index + 1;
    that.query_lottery(page_index)
    that.setData({
      page_index: page_index
    })
  },

  onPullDownRefresh: function () {
    var that = this;
    that.query_lottery()
    wx.showLoading({
      title: '玩命加载中~',
    })
    wx.stopPullDownRefresh()
  },
})