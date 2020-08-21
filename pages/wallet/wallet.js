// pages/wallet/wallet.js
const app = getApp()

Page({

   /**
    * 页面的初始数据
    */
   data: {
      Withdrawal_dialog: false,
      success_dialog: false,
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      this.get_user()
   },

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function () {

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
      })
   },

   show_dialog: function () {
      this.setData({
         Withdrawal_dialog: true
      })
   },
 
   hidden_dialog() {
      this.setData({
         Withdrawal_dialog: false
      })
   },
   
   Withdrawal() {
      let that = this
      if(!that.data.fee){
         wx.showToast({
           title: '请输入提现金额',
           icon:'none'
         })
         return
      }
      if(that.data.fee < 3){
         wx.showToast({
            title: '提现金额不能小于3块钱',
            icon:'none'
          })
          return
      }
      app.request({
         url: 'wxpay/submit_withdraw',
         method: 'post',
         data: {
            fee: that.data.fee * 100
         },
      }).then(res => {
         console.log(res)
         if (res == 'err') {
            wx.showToast({
              title: '余额不足',
              icon:'none'
            })
         }
         if (res.err_code == 0){
            that.setData({
               success_dialog: true
            })
         }
         that.setData({
            Withdrawal_dialog: false,
            fee:''
         })
      })
   },
   hidden_successDialog() {
      this.setData({
         success_dialog: false
      })
   },
   enter_cashRecord() {
      wx.navigateTo({
         url: '../cash_record/cash_record',
      })
   },
   changeFee(e) {
      this.setData({
         fee: e.detail.value
      })
   },

   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function () {

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
   onShareAppMessage: function () {

   }
})