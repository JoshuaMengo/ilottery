//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    PageCur: 'index',
    show_banner: true,
    pass_time: 3,
    is_close: true,
    show_tiao:false
  },

  onLoad: function (options) {
    var that = this
    that.query_lottery()
    that.close_pocket()
    if (options.show) {
      that.setData({
        show_tiao: false
      })
    }else{
      that.setData({
        show_tiao: true
      })
      setTimeout(function () {
        that.setData({
          show_tiao: false
        })
      }, 3000)
    }
   

    // var passTime = setInterval(function () {
    //   console.log(that)
    //   if(that.data.pass_time > 0){
    //     that.setData({
    //       pass_time:that.data.pass_time-=1
    //     })
    //   }else{
    //     clearInterval(passTime);
    //   }
    // }, 1000);
  },

  isPass() {
    this.setData({
      show_tiao: true
    })
  },
  onShow: function () {
    this.query_lottery()
  },

  NavChange(e) {
    var that = this
    that.setData({
      PageCur: e.currentTarget.dataset.cur
    })
    if (e.currentTarget.dataset.cur == 'create') {
      wx.navigateTo({
        url: '../edit/edit',
      })
      setTimeout(function () {
        that.setData({
          PageCur: 'index'
        })
      }, 2000)
      return;
    }
  },


  NavChange2(e) {
    var that = this
    that.setData({
      PageCur: e.currentTarget.dataset.cur
    })
    // wx.navigateTo({
    //   url: '../draw/draw',
    // })
  },



  close_pocket() {
    let that = this
    app.request({
      url: 'admin_user/close_pocket',
      method: 'post',
    }).then(res => {
      that.setData({
        is_close: res.data.is_close
      })
    })
  },

  query_lottery: function (page_index) {
    var that = this
    app.request({
      url: 'lottery/query',
      method: 'post',
      data: {
        page_index: parseInt(page_index) || 0
      },
    }).then(res => {
      console.log(res, '--------=-')
      if (page_index && page_index > 0) {
        var lottery_list = that.data.lottery_list
      } else {
        var lottery_list = []
      }
      if (res.err_code == 0) {
        wx.hideLoading()
        for (let i in res.data.list) {
          lottery_list.push(res.data.list[i])
        }
        that.setData({
          show_banner: false,
          lottery_list: lottery_list,
          recommend_list: res.data.recommend_list,
          point: res.data.point,
          total_count: res.data.total_count,
          bannerList: res.data.banner.list
        })
      }
    })
  },

  enter_edit: function () {
    wx.navigateTo({
      url: '../edit/edit',
    })
  },

  tiaoguo: function () {
    this.setData({
      show_banner: false,
      show_loading: true,
    })
  },

  enter_banner_dd: function () {
    wx.navigateToMiniProgram({
      appId: 'wx7bb576902363f4ff',
      path: 'pages/coupon/couponCenter?&ald_media_id=32593&ald_link_key=61611b243ad535d5&unionid=p-324867m-423-47-6',
      success(res) {
        that.mini_navigate('当当banner', '跳转')
      },
      fail(res) {
        console.log(res)
      },
    })
  },

  onShareAppMessage: function () {
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

  onReachBottom: function () {
    // var that = this;
    // var page_index = that.data.page_index + 1;
    // that.query_lottery(page_index)
    // that.setData({
    //   page_index: page_index
    // })
  },

  onPullDownRefresh: function () {
    var that = this;
    that.query_lottery(0)
    that.setData({
      page_index: 0
    })
    wx.showLoading({
      title: '玩命加载中~',
    })
    wx.stopPullDownRefresh()
  },
})