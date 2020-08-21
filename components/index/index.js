// components/index/index.js
const app = getApp()

Component({
  options: {
    styleIsolation: 'isolated'
  },
  /**
   * 组件的属性列表
   */
  properties: {
    lottery_list: Array,
    recommend_list: Array,
    total_count: String,
    point: String,
    bannerList: Array,
  },

  /**
   * 组件的初始数据
   */
  data: {
    logo: 'https://lottery.72needyou.cn/lottery/data/image/material/gift.png',
    banner_img: 'https://lottery.72needyou.cn/lottery/data/image/material/banner.png',
    lottery_list: [],
    recommend_list: [],
    page_index: 0,
  },

  /**
   * 组件的方法列表
   */

  methods: {
    enter_lottery: function (e) {
      wx.navigateTo({
        url: '../lottery/lottery?lid=' + e.currentTarget.dataset.lid,
      })
    },

    enter_jifen: function () {
      wx.navigateTo({
        url: '/pages/jifen/jifen',
      })
    },

    enter_turn: function () {
      wx.navigateTo({
        url: '/pages/turn/turn',
      })
    },

    enter_sign: function () {
      wx.navigateTo({
        url: '/pages/jifen/jifen',
      })
    },

    query_banner() {
      var that = this
      app.request({
        url: 'lottery/query_banner',
        method: 'post',

      }).then(res => {
        console.log('获取banner', res)
        that.setData({
          bannerList: res.data.list
        })
      })
    },

    enter_miniProgram(e){
      console.log(e.target.dataset)
      wx.navigateToMiniProgram({
        appId: e.target.dataset.appid,
        path: e.target.dataset.path,
      
        success(res) {
          // 打开成功
        }
      })
    },

    enter_mini: function (e) {
      var that = this
      if (e.currentTarget.dataset.flag == 'dangdang') {
        that.mini_navigate('当当', '点击')
        wx.navigateToMiniProgram({
          appId: 'wx7bb576902363f4ff',
          path: 'pages/coupon/couponCenter?&ald_media_id=32593&ald_link_key=61611b243ad535d5&unionid=p-324867m-423-47-6',
          success(res) {
            // 打开成功
            that.mini_navigate('当当', '跳转')
          }
        })
      } else {
        that.mini_navigate('领走对象', '点击')
        wx.navigateToMiniProgram({
          appId: 'wxf7dde8538a11453f',
          path: 'pages/index/index',
          success(res) {
            // 打开成功
            that.mini_navigate('领走对象', '跳转')
          }
        })
      }
    },

    mini_navigate: function (url, status) {
      app.mini_navigate(url, status).then(res => {
        console.log(res)
      })
    },
  }
})