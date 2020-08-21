// pages/success/success.js
import Card from '../../palette/card';
const app = getApp()

Page({

   /**
    * 页面的初始数据
    */
   data: {
      uninterested: 0,
      codeArr: ['A', '1', 'B', '2', 'C', '3', 'D', '4'],
      code: 'A1B2C3D4',
      poster_hidden: true,

   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      wx.showLoading({
        title: '加载中',
      })
      let that = this
      if (options) {
         that.get_lottery(options.lid)
         that.get_share_code(options.lid)

         console.log(options)
         // let code = options.code
         // var arr = code.split('')
         that.setData({
            // code: code,
            // codeArr: arr,
            lid: options.lid
         })
      }
      that.query_ad()
      that.get_user()
   },

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function () {

   },

   enter_more(e){
      let res = e.currentTarget.dataset.res
      console.log(e.currentTarget.dataset.res)
      wx.navigateToMiniProgram({
         appId: res.appid,
         path: res.path,
         
         envVersion: 'develop',
         success(res) {
           // 打开成功
           console.log(res)
         },
         fail(err){
            console.log(err)
         }
       })
   },

   changeInterested(e) {
      console.log(e)
      let val = Number(e.target.dataset.value) + 1
      this.setData({
         uninterested: val
      })
   },

   preventTouchMove: function () {
      return;
    },
  
    get_share_code: function (lid) {
      var that = this
      app.request({
        url: 'lottery/get_share',
        method: 'post',
        data: {
          uid: parseInt(wx.getStorageSync('user_id')),
          lid: lid || that.data.lottery_info.lid,
          page: 'pages/help/help',
          is_hyaline: true
        },
      }).then(res => {
        that.setData({
          qr_code: res.data.url
        })
      })
    },

   hide_modal: function () {
      console.log('111')
      this.setData({
        poster_hidden: true,
      })
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
         wx.hideLoading();
      })
   },

   create_poster: function () {
      var that = this
      wx.showLoading({
         title: '玩命生成中~',
      })
      var palette = new Card().palette()
      var user_info = that.data.user_info
      var lottery_info = that.data.lottery_info
      palette.views[1].url = user_info.avatarUrl || that.data.logo
      palette.views[2].text = user_info.nickName
      palette.views[3].text = '邀请你帮Ta助力抽奖'
      palette.views[4].url = lottery_info.photo
      palette.views[5].text = '@' + lottery_info.ads[0].name + ' 发起'
      palette.views[6].text = lottery_info.prizes[0].name + ' x' + lottery_info.prizes[0].num
      if (palette.views[6].text.length > 20) {
         palette.views[7].css.top = '780rpx'
      }
      if (lottery_info.is_countdown) {
         palette.views[7].text = lottery_info.start_time + ' 自动开奖'
      } else {
         palette.views[7].text = '满' + lottery_info.full_num + ' 人自动开奖'
      }
      palette.views[8].url = that.data.qr_code
      that.setData({
         poster_hidden: false,
         template: palette
      })
      console.log(palette)
   },
   
   onImgOK(e) {
      var that = this
      wx.hideLoading();
      var imagePath = e.detail.path;
      that.setData({
        imagePath: imagePath
      })
    },

    saveImage() {
      var that = this
      wx.saveImageToPhotosAlbum({
        filePath: that.data.imagePath,
        success: (res) => {
          that.setData({
            poster_hidden: true
          })
          wx.showToast({
            title: '已保存到相册',
          })
        },
        fail() {
          wx.showModal({
            title: '保存失败！',
            content: '请检查相册访问是否授权',
            success(res) {
              if (res.confirm) {
                wx.openSetting({
                  success(res) {
                    console.log(res.authSetting)
                  }
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      });
    },

   get_lottery: function (lid) {
      var that = this
      app.request({
         url: 'lottery/new_get',
         method: 'post',
         data: {
            lid: lid
         },
      }).then(res => {
         if (res.data.is_pocket) {
            app.request({
               url: 'lottery/get_my_status',
               method: 'post',
               data: {
                  lid: res.data.lid,
               },
            }).then(res => {
               that.setData({
                  result_info: res.data,
               })
            })
         }
         that.setData({
            show_loading: false,
            lottery_info: res.data,
            show_banner: false

         })


         if (res.data.forbid_share) {
            wx.hideShareMenu()
         }
      })
   },
   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function () {

   },

   goback() {
      wx.navigateBack({
         delta: 1
      })
   },

   query_ad() {
      var that = this
      app.request({
         url: 'lottery/query_ad',
         method: 'post',

      }).then(res => {
         that.setData({
            adList: res.data.list
         })
      })
   },

   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function () {

   },

   /**
    * 生命周期函数--监听页面卸载
    */
   onUnload: function () {

   },

   /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
   onPullDownRefresh: function () {

   },

   /**
    * 页面上拉触底事件的处理函数
    */
   onReachBottom: function () {

   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function (res) {
      var that = this
      var userInfo = that.data.userInfo
      console.log('pages/lottery/lottery?lid=' + that.data.lottery_info.lid + '&share=1&uid=' + wx.getStorageSync('user_id'))
      return {
         title: '免费抽取' + that.data.lottery_info.prizes[0].name + 'x' + that.data.lottery_info.prizes[0].num,
         // path: 'pages/help/help',
         path: 'pages/lottery/lottery?lid=' + that.data.lid + '&share=1&uid=' + wx.getStorageSync('user_id'),
         imageUrl: that.data.lottery_info.introduce_pic[0],
         success: function (res) {

         },
         fail: function (res) {
            // 转发失败
         }
      }
   },
})