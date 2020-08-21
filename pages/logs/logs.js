//logs.js
const app = getApp()

Page({
  data: {
    logs: [],
    isCard: false,
    page_index: 0,
  },

  onLoad: function (options) {
    var that = this
    if(options && options.type == 'fee'){
      that.query_report('lottery/query_feedback', 0)
      that.setData({
        is_admin: true,
        url: 'lottery/query_feedback',
      })
      return
    }
    app.judge_admin().then(res => {
      
      if(res.data.is_admin){
        that.query_report('lottery/query_report', 0)
        that.setData({
          is_admin: res.data.is_admin,
          url: 'lottery/query_report',
        })
      }else{
        that.query_report('lottery/query_my_report', 0)
        that.setData({
          is_admin: res.data.is_admin,
          url: 'lottery/query_my_report',
        })
      }
    })
  },

  handle: function(e){
    var that = this
    app.request({
      url: 'lottery/handle_report',
      method: 'post',
      data: {
        rid: parseInt(e.currentTarget.dataset.rid) || 0
      },
    }).then(res=>{
      if(res.err_code == 0){
        wx.showToast({
          title: '已处理~',
        })
        that.query_report(that.data.url, 0)
      }
    })
  },

  enter_lottery: function(e){
    wx.navigateTo({
      url: '../lottery/lottery?lid=' + e.currentTarget.dataset.lid,
    })
  },

  preimg: function(e){
    var idx = e.currentTarget.dataset.idx
    wx.previewImage({
      current: this.data.report_list[idx].photos[0],
      urls: this.data.report_list[idx].photos,
    })
  },

  query_report: function(url, page_index){
    var that = this
    app.request({
      url: url,
      method: 'post',
      data: {
        page_index: parseInt(page_index) || 0
      },
    }).then(res=>{
      var report_list = that.data.report_list || []
      for(let i of res.data.list){
        report_list.push(i)
      }
      that.setData({
        report_list: report_list
      })
    })
  },

  onReachBottom: function () {
    var that = this;
    var page_index = that.data.page_index + 1;
    that.query_report(that.data.url, page_index)
    that.setData({
      page_index: page_index
    })
  },
})
