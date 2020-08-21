// pages/turn/turn.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cur_idx: 0,
    notice_top: 0,
    height: 70,
    modalName: '',
    cur_item: 1,
    range_arr: [1, 2, 3, 6, 9, 8, 7, 4],
    range_block: [
      { img: '/resources/new/0.png', name: '幸运币 +100', },
      { img: '/resources/new/1.png', name: '爱奇艺vip月卡', },
      { img: '', name: '谢谢参与', },
      { img: '/resources/new/3.png', name: 'iphone 11', },
      { img: '', name: '抽奖', is_btn: true },
      { img: '/resources/new/5.png', name: 'YSL #16', },
      { img: '', name: '谢谢参与', },
      { img: '/resources/new/1.png', name: '爱奇艺vip月卡', },
      { img: '/resources/new/0.png', name: '幸运币 +50', },
    ],
    icon0: '/resources/new/gold.png',
    icon1: '/resources/new/aqy.png',
    icon3: '/resources/new/iphone.png',
    icon5: '/resources/new/ysl.png',
    icon7: '/resources/new/aqy.png',
    icon8: '/resources/new/gold.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.get_lw()
    
  },

  // onHide: function () {
  //   clearInterval(this.data.time_id1)
  // },

  // onUnload: function(){
  //   clearInterval(this.data.time_id1)
  // },

  lw_btn: function(){
    if (this.data.reward_point<50){
      wx.showModal({
        title: '幸运币不足',
        content: '可前往完成每日任务获取幸运币',
        success(res){
          if(res.confirm){
            wx.navigateTo({
              url: '../jifen/jifen',
            })
          }
        }
      })
      return;
    }
    this.rotate_lw()
  },

  rotate_lw: function(){
    var that = this
    app.request({
      url: 'lottery/rotate_lw',
      method: 'post',
      data: {},
    }).then(res=>{
      that.turn()
      that.setData({
        lw_data: res.data,
        reward_point: that.data.reward_point - 50
      })
      
    })
  },

  get_lw: function(){
    var that = this
    app.request({
      url: 'lottery/get_lw',
      method: 'post',
      data: {},
    }).then(res=>{
      that.setData({
        turn_list: res.data.list,
        reward_point: res.data.reward_point,
        broadcast: res.data.broadcast,
      })
      // var time_id1 = setInterval(() => {
      //   that.data.notice_top -= that.data.height;
      //   that.setData({
      //     notice_top: that.data.notice_top
      //   })
      //   if (that.data.notice_top == (-(that.data.height) * that.data.broadcast.length)) {
      //     console.log('====')
      //     var broadcast = that.data.broadcast.concat(that.data.broadcast)
      //     that.setData({
      //       broadcast: broadcast
      //       // notice_top: 0,
      //     })
      //   }
      // }, 2000)
      // that.setData({
      //   time_id1: time_id1
      // })
    })
  },

  turn: function(time1, time2){
    var that = this
    var interval = setInterval(function () {
      if (that.data.cur_idx == 7) {
        that.setData({
          cur_idx: 0,
          cur_item: 1
        })
      } else {
        var cur_idx = that.data.cur_idx + 1
        that.setData({
          cur_idx: cur_idx,
          cur_item: that.data.range_arr[cur_idx]
        })
      }
    }, 100)
    setTimeout(function () {
      clearInterval(interval)
      that.turn2()
    }, 4000)
  },

  turn2: function(){
    var that = this
    var interval = setInterval(function () {
      if (that.data.cur_idx == 7) {
        that.setData({
          cur_idx: 0,
          cur_item: 1
        })
      } else {
        var cur_idx = that.data.cur_idx + 1
        that.setData({
          cur_idx: cur_idx,
          cur_item: that.data.range_arr[cur_idx]
        })
      }
    }, 300)
    setTimeout(function () {
      clearInterval(interval)
      that.turn3()
    }, 2000)
  },

  turn3: function () {
    var that = this
    var interval = setInterval(function () {
      if (that.data.cur_idx == 7) {
        that.setData({
          cur_idx: 0,
          cur_item: 1
        })
      } else {
        var cur_idx = that.data.cur_idx + 1
        that.setData({
          cur_idx: cur_idx,
          cur_item: that.data.range_arr[cur_idx]
        })
      }
      if (that.data.cur_item == that.data.lw_data.lwid) {
        clearInterval(interval)
        that.setData({
          modalName: 'Image',
        })
        that.get_lw()
        setTimeout(function(){
          that.setData({
            modalName: '',
          })
        }, 1000)
        
        // if(that.data.lw_data.is_point){
        //   wx.showToast({
        //     title: '中奖啦',
        //   })
        // }else{
        //   wx.showToast({
        //     title: '继续加油哦',
        //   })
        // }
      }
    }, 700)
  },
})