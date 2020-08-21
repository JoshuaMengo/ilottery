// components/mine/mine.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    is_close:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    qr_code: "https://lottery.72needyou.cn/lottery/data/image/material/tuiguang.jpg"
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      let that = this
      that.get_user()
      that.setData({
        my_uid: wx.getStorageSync('user_id')
      })
      app.judge_admin().then(res => {
        that.setData({
          is_admin: res.data.is_admin
        })
      })
      app.request({
        url: 'admin_user/super_admin_judge',
        method: 'post',
        data: {},
      }).then(res => {
        console.log(res)
        that.setData({
          is_super: res.data.is_super
        })
      })
    },
  },

  pageLifetimes: {
    show: function(){
      this.get_user()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    enter_market: function () {
      wx.showModal({
        title: '积分集市暂未开放',
        content: '敬请期待',
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
      })
    },

    enter_record: function (e) {
      wx.navigateTo({
        url: '../record/record?status=' + e.currentTarget.dataset.status,
      })
    },
    
   

    get_addr: function () {
      var that = this
      wx.chooseAddress({
        success(res) {
          app.request({
            url: 'user/update_addr',
            method: 'post',
            data: {
              realName: res.userName,
              province: res.provinceName,
              city: res.cityName,
              country: res.countyName,
              region_detail: res.detailInfo,
              phone: res.telNumber,
              wechatPhone: ''
            },
          }).then(res => {
            if (res.err_code == 0) {
              wx.showToast({
                title: '已填写保存~',
              })
            }
          })
        }
      })
    },

    dingyue: function(){
      wx.requestSubscribeMessage({
        tmplIds: ['Nswg2ITa1S5zHDos6bN2Jz-2vOfvREBEm-tNm5LN6V8', 'Nswg2ITa1S5zHDos6bN2J1LQH7dSeOtYVAAwa1yk4Po', 'Nswg2ITa1S5zHDos6bN2JzDZqZHGWEFr_nanvvQ5AfE'],
        success(res) {
          console.log(res)
         },
         complete(res){
           console.log(res)
         }
      })
    },
  }
})
