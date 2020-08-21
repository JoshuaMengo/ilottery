// pages/edit/edit.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dialogShow: false,
    buttons: [{
      text: '取消',
      id: '1'
    }, {
      text: '去支付',
      id: '2'
    }],

    cover_img: 'https://cyc.72needyou.cn/cyc/data/image/material/redPocket.png',
    // cover_img:'https://cjzs.lodidc.cn/cjzs/data/image/material/redPocket.png',
    isCompaper: true,
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
    awards: [{
      name: '',
      photo: '',
      num: '',
      level: ''
    }],
    ads: [{
      name: '',
      img: '',
      wechat: ''
    }],
    desc_imgs: [],
    btn_disabled: false,
    src: 'https://lottery.72needyou.cn/lottery/data/image/material/lottery.jpg'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

    app.judge_admin().then(res => {
      that.setData({
        is_admin: res.data.is_admin
      })
    })

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

  remark_input: function (e) {
    this.setData({
      remarks: e.detail.value
    })
  },


  tapDialogButton(e) {
    let that = this
    let fee = (that.data.fee * that.data.paper_num) * 100

    console.log(e)
    if (e.detail.item.id == '2') {
      app.request({
        url: 'wxpay/wxpay',
        method: 'post',
        data: {
          total_fee: fee, //金额
          body: 'red_pocket',
          pay_type: 'red_pocket'
        },
      }).then(res => {
        console.log(res)
        if (res.err_code == 0) {
          that.wxpayment(res)
        }
      })
    }
    this.setData({
      dialogShow: false,
    })
  },

  changePaper() {
    this.setData({
      isCompaper: !this.data.isCompaper
    })
  },

  wechat_input: function (e) {
    var ads = this.data.ads
    ads[0]['wechat'] = e.detail.value
    this.setData({
      ads: ads
    })
  },

  command_change: function (e) {
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

  share_change: function (e) {
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

  command_input: function (e) {
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
    if (e.detail.value == 0) {
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
    awards.push({
      name: '',
      photo: '',
      num: '',
      level: ''
    })
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

  confirm() {
    let that = this
    if (((that.data.fee * 100) / (that.data.paper_num)) < 1 && that.data.is_random) {
      wx.showToast({
        title: '单个红包不能少于0.01元',
        icon: 'none'
      })
      return
    }
    if ((that.data.fee * 100) < 1 && !that.data.is_random) {
      wx.showToast({
        title: '单个红包不能少于0.01元',
        icon: 'none'
      })
      return
    }
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              if (that.data.is_admin) { //管理员跳过支付流程
                that.set_lottery()
                return
              }
              that.setData({
                dialogShow: true
              })
            }
          })
        } else {
          if (that.data.is_admin) {
            that.set_lottery()
            return
          }
          that.setData({
            dialogShow: true
          })
        }
      }
    })
  },

  wxpayment(res) {
    let that = this
    wx.requestPayment({
      timeStamp: res.data.timeStamp,
      nonceStr: res.data.nonceStr,
      package: res.data.package,
      signType: res.data.signType,
      paySign: res.data.paySign,
      success(resp) {
        app.request({
          url: 'wxpay/update_pay',
          method: 'post',
          data: {
            trade_no: res.data.trade_no
          }
        }).then(success => {
          if (success.err_code == 0) {
            that.set_lottery()
          }
        })
      },
      fail(resp) {
        wx.showToast({
          title: '支付失败',
          icon: "none"
        })
      }
    })
  },

  set_lottery: function (e) {
    var that = this
    if (!that.data.is_auth) {
      return;
    }

    var phone = ''
    var name = ''
    if (that.data.is_full) {
      var start_time = ''
    } else {
      var start_time = that.data.date + ' ' + that.data.time
    }

    var params = [{
        value: that.data.cover_img,
        name: '活动封面图'
      },
      // {
      //   value: that.data.awards[0].name,
      //   name: '奖品名称'
      // },
      // {
      //   value: that.data.awards[0].num,
      //   name: '奖品数量'
      // },


      // {
      //   value: that.data.get_award_method,
      //   name: '领奖方式'
      // },
      {
        value: that.data.open_award_method,
        name: '开奖方式'
      },
      {
        value: that.data.ads[0].name,
        name: '发起方'
      },
      {
        value: that.data.ads[0].img,
        name: '二维码'
      },
      {
        value: that.data.desc,
        name: '抽奖活动说明'
      },
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
    if (that.data.is_countdown) {
      if (!that.data.date || !that.data.time) {
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
    if (that.data.need_command) {
      if (!that.data.command) {
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

    let prizes_data = [{
      name: that.data.isCompaper ? '普通红包' : '拼手气红包' + that.data.fee + '元',
      num: that.data.paper_num,
      photo: 'https://cjzs.lodidc.cn/cjzs/data/image/material/redPocket.png',
      is_random: that.data.isCompaper,
      total_fee: that.data.isCompaper ? (that.data.fee * that.data.paper_num) * 100 : that.data.fee * 100
    }]
    console.log(prizes_data)
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
        // prizes: that.data.awards,
        prizes: prizes_data,
        photo: that.data.cover_img || '',
        ads: that.data.ads,
        remarks: that.data.remarks || '',
        is_pocket: true //是否红包
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
  },
  changeFee(e) {
    this.setData({
      fee: e.detail.value
    })
  },
  changeNum(e) {
    this.setData({
      paper_num: e.detail.value
    })
  }
})