// pages/edit/edit.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgList: [],
    get_award_range: ['倒计时自动抽奖', '满人自动抽奖'],
    open_award_range: ['填写收货地址', '联系发起人'],
    jiafen_range: ['微信号加粉', '公众号加粉'],
    forbid_share: false,
    need_command: false, 
    modalName: '',
    date: '',
    time: '',
    qrcode: '',
    awards: [
      { name: '', photo: '', num: '', level: '' }
    ],
    ads: [
      { name: '', img: '', wechat: '' }
    ],
    desc_imgs: [],
    btn_disabled: false,
    src: 'https://lottery.72needyou.cn/lottery/data/image/material/lottery.jpg'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          var is_auth = false
        } else {
          var is_auth = true
        }
        that.setData({
          is_auth: is_auth
        })
      }
    })
    let now_date = new Date()
    that.setData({
      limit_start_date: now_date.getFullYear() + '-' + (parseInt(now_date.getMonth()) + 1) + '-' + now_date.getDate(),
      limit_start_time: now_date.getHours() + ':' + now_date.getMinutes()
    })
  },

  remark_input: function(e){
    this.setData({
      remarks: e.detail.value
    })
  },  

  wechat_input: function(e){
    var ads = this.data.ads
    ads[0]['wechat'] = e.detail.value
    this.setData({
      ads: ads
    })
  },

  command_change: function(e){
    if (e.detail.value) {
      this.setData({
        modalName: 'Modal',
      })
    }
    this.setData({
      need_command: e.detail.value
    })
  },

  phone_change: function (e) {
    this.setData({
      need_phone: e.detail.value
    })
  },

  share_change: function(e){
    this.setData({
      forbid_share: e.detail.value
    })
  },

  onGotUserInfo: function (e) {
    var that = this
    var userInfo = e.detail.userInfo
    if (e.detail.userInfo) {
      that.setData({
        userInfo: userInfo,
        is_auth: true
      })
      app.request({
        url: 'user/set',
        method: 'post',
        data: {
          nickName: userInfo.nickName,
          gender: userInfo.gender,
          avatarUrl: userInfo.avatarUrl,
        },
      }).then(res => {
        console.log('设置用户信息')
      })
      // 首次授权 +积分
      // app.request({
      //   url: 'user/update_auth',
      //   method: 'post',
      //   data: {},
      // }).then(res => {
      //   console.log('更新用户授权积分')
      // })
    }
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  DelImg(e) {
    var that = this
    wx.showModal({
      title: '删除图片',
      content: '确定要删除这张图片吗？',
      success: res => {
        if (res.confirm) {
          that.data.desc_imgs.splice(e.currentTarget.dataset.index, 1);
          that.setData({
            desc_imgs: that.data.desc_imgs
          })
        }
      }
    })
  },

  ChooseImage: function (e) {
    var that = this
    var length = that.data.desc_imgs.length
    wx.chooseImage({
      count: 6 - length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
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

  command_input: function(e){
    this.setData({
      command: e.detail.value
    })
  },

  textareaAInput(e) {
    this.setData({
      desc: e.detail.value,
      length: e.detail.value.length
    })
  },

  TimeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },

  DateChange(e) {
    let now_date = new Date()
    this.setData({
      date: e.detail.value
    })
    var cur_year = parseInt(e.detail.value.split('-')[0])
    var cur_month = parseInt(e.detail.value.split('-')[1])
    var cur_day = parseInt(e.detail.value.split('-')[2])
    if (cur_day == now_date.getDate() && cur_month == (now_date.getMonth() + 1) && cur_year == now_date.getFullYear()) {
      this.setData({
        limit_start_time: now_date.getHours() + ':' + now_date.getMinutes()
      })
    } else {
      this.setData({
        limit_start_time: '00:00'
      })
    }
  },

  aw_name_input: function (e) {
    var idx = e.currentTarget.dataset.idx
    var awards = this.data.awards
    awards[idx].name = e.detail.value
    this.setData({
      awards: awards
    })
  },

  aw_num_input: function (e) {
    if(e.detail.value == 0){
      wx.showToast({
        title: '数量不能为0~',
      })
      return;
    }
    var idx = e.currentTarget.dataset.idx
    var awards = this.data.awards
    awards[idx].num = e.detail.value
    this.setData({
      awards: awards
    })
  },

  aw_level_input: function (e) {
    var idx = e.currentTarget.dataset.idx
    var awards = this.data.awards
    awards[idx].level = parseInt(e.detail.value) 
    this.setData({
      awards: awards
    })
  },

  cover_upload: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        var photos = that.data.photos || []
        wx.showLoading({
          title: '上传中~',
        })
        app.uploadImg(res.tempFilePaths[0]).then(res => {
          wx.hideLoading()
          that.setData({
            cover_img: res.data.url
          })
        })
      }
    })
  },

  add_qrcode: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        var photos = that.data.photos || []
        wx.showLoading({
          title: '上传中~',
        })
        app.uploadImg(res.tempFilePaths[0]).then(res => {
          wx.hideLoading()
          var ads = that.data.ads
          ads[0].img = res.data.url
          that.setData({
            ads: ads
          })
        })
      }
    })
  },

  qrcode_input: function (e) {
    var ads = this.data.ads || []
    ads[0].name = e.detail.value
    this.setData({
      ads: ads
    })
  },

  open_Change: function (e) {
    if (e.detail.value == 0) {
      this.setData({
        open_award_method: this.data.get_award_range[e.detail.value],
        is_countdown: true,
        is_full: false,
      })
    } else {
      this.setData({
        open_award_method: this.data.get_award_range[e.detail.value],
        is_full: true,
        is_countdown: false,
      })
    }

  },

  address_Change: function (e) {
    if (e.detail.value == 0) {
      this.setData({
        get_award_method: this.data.open_award_range[e.detail.value],
        need_addr: true,
        need_contact: false,
      })
    } else {
      this.setData({
        get_award_method: this.data.open_award_range[e.detail.value],
        need_contact: true,
        need_addr: false
      })
    }
  },

  add_award: function () {
    var awards = this.data.awards
    awards.push({ name: '', photo: '', num: '', level: '' })
    this.setData({
      awards: awards
    })
  },

  del_award: function () {
    var awards = this.data.awards
    awards.splice(awards.length - 1, 1)
    this.setData({
      awards: awards
    })
  },

  full_num_input: function (e) {
    this.setData({
      full_num: e.detail.value
    })
  },

  confirm: function (e) {
    var that = this
    if(!that.data.is_auth){
      return;
    }

    var phone = ''
    var name = ''
    if(that.data.is_full){
      var start_time = ''
    }else{
      var start_time = that.data.date + ' ' + that.data.time
    }
    
    var params = [
      { value: that.data.cover_img, name: '活动封面图' },
      { value: that.data.awards[0].name, name: '奖品名称' },
      { value: that.data.awards[0].num, name: '奖品数量' },
      { value: that.data.get_award_method, name: '领奖方式' },
      { value: that.data.open_award_method, name: '开奖方式' },
      { value: that.data.ads[0].name, name: '发起方' },
      { value: that.data.ads[0].img, name: '二维码' },
      { value: that.data.desc, name: '抽奖活动说明' },
    ]
    for (var i in params) {
      if (!params[i].value) {
        wx.showModal({
          title: params[i].name + '未填写',
          content: '请填写完整',
        })
        return;
      }
    }
    if(that.data.is_countdown){
      if (!that.data.date || !that.data.time){
        wx.showModal({
          title: '开奖时间未填写',
          content: '请填写完整',
        })
        return;
      }
    }
    if (that.data.is_full) {
      if (!that.data.full_num) {
        wx.showModal({
          title: '开奖人数未填写',
          content: '请填写完整',
        })
        return;
      }
    }
    if(that.data.need_command){
      if(!that.data.command){
        wx.showModal({
          title: '参与口令未设置',
          content: '请填写完整',
        })
      }
    }
    that.setData({
      btn_disabled: true
    })
    wx.showLoading({
      title: '正在创建中~',
    })

    app.request({
      url: 'lottery/set',
      method: 'post',
      data: {
        is_countdown: that.data.is_countdown || false,
        is_full: that.data.is_full || false,
        need_addr: that.data.need_addr || true,
        need_contact: that.data.need_contact || false,
        need_command: that.data.need_command || false,
        need_phone: that.data.need_phone || false,
        forbid_share: that.data.forbid_share || false,
        command: that.data.command || '',
        wechatphone: that.data.ads[0].name,
        phone: phone,
        start_time: start_time || '',
        full_num: that.data.full_num || 0,
        introduce_content: that.data.desc,
        introduce_pic: that.data.desc_imgs,
        name: name,
        prizes: that.data.awards,
        photo: that.data.cover_img || '',
        ads: that.data.ads,
        remarks: that.data.remarks || ''
      },
    }).then(res => {
      if (res.err_code == 0) {
        wx.showToast({
          title: '发起成功',
        })
        wx.hideLoading()
        that.setData({
          btn_disabled: false
        })
        wx.redirectTo({
          url: '../lottery/lottery?lid=' + res.data.lid,
        })
      }
    })
  }
})