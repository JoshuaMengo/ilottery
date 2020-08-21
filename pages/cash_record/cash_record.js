// pages/cash_record/cash_record.js
const app = getApp()

Page({

   /**
    * 页面的初始数据
    */
   data: {
      modalName: '',
      desc_imgs: [],
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      this.query_transaction()
   },

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function () {

   },

   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function () {

   },

   textareaAInput: function (e) {
      this.setData({
         other_reason: e.detail.value
      })
   },

   send: function () {
      var that = this
      // if (!that.data.is_auth) {
      //    return;
      // }
      // 反馈结果通知
      if (app.globalData.miniName == '快点抽个奖') {
         wx.requestSubscribeMessage({
            tmplIds: ['hR5kpT7glA765rZOwMOhjTYu1vWqKQ-IvSoe56Wp-jg'],
            success(res) {}
         })
      } else {
         wx.requestSubscribeMessage({
            tmplIds:['lFhj0oj8QlEHwrnOu47Ab9EkzJGG4SQFh2Es0we22UE'],
            success(res) {}
         })
      }
      app.request({
         url: 'lottery/set_feedback',
         method: 'post',
         data: {
            // reason: that.data.reason,
            reason: that.data.other_reason,
            // lid: that.data.lid || '',
            photos: that.data.desc_imgs || []
         },
      }).then(res => {
         if (res.err_code == 0) {
            wx.showToast({
               title: '已提交~',
            })
            that.setData({
               modalName: ''
            })
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

   hideModal: function () {
      this.setData({
         modalName: '',
         desc_imgs: [],
      })
   },

   show_report: function (e) {
      this.setData({
         modalName: 'report',
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

   query_transaction() {
      let that = this
      app.request({
         url: 'wxpay/query_transaction',
         method: 'post',
         data: {
            page_index: 0
         },
      }).then(res => {
         that.setData({
            countData: res.data.list
         })
      })
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
   onShareAppMessage: function () {

   }
})