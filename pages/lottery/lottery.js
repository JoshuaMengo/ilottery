// pages/lottery/lottery.js
import Card from '../../palette/card';
const app = getApp()

// 在页面中定义插屏广告
let interstitialAd = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    Withdrawal_dialog: false,
    modalName: '',
    disabled: false,
    examine: false,
    show_gif: false,
    show_loading: true,
    show_banner: false,
    poster_hidden: true,
    miniName: app.globalData.miniName,
    front: false,
    join_icon: 'https://lottery.72needyou.cn/lottery/data/image/material/success2.png',
    logo: 'https://lottery.72needyou.cn/lottery/data/image/material/gift.png',
    uninterested: 0
  },

  onLoad: function (options) {
    var that = this
    var lid = ''
    var uid = ''
    var share = ''
    if (decodeURIComponent(options.scene)) {
      lid = decodeURIComponent(options.scene).split('&')[1]
      uid = decodeURIComponent(options.scene).split('&')[0]
      share = decodeURIComponent(options.scene).split('&')[2]
    }
    if (options.lid) {
      lid = options.lid
      uid = options.uid
      share = '1'
    }
    that.get_lottery(lid)
    // console.log(that.data.lottery_info,'-=-=-=-=-')

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-3551ca06a29b5ee5'
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }

    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
    that.get_user()
    that.get_share_code(lid)
    app.judge_perm(lid).then(res => {
      that.setData({
        is_admin: res.data.has_perm,
        examine: res.data.has_perm ? true : false
      })
      if (res.data.has_perm) {
        that.query_comment(lid, 'lottery/admin_get_comment')
      } else {
        that.query_comment(lid, 'lottery/get_comment')
      }
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
    setTimeout(function () {
      that.setData({
        show_tiao: true
      })
    }, 3000)

    if (share == '1' && uid) {
      console.log('助力成功')
      that.help(lid, uid)
    }
    that.restTime()
  },

  onShow: function () {
    this.get_lottery(this.data.lottery_info.lid)
    this.get_user()
    if (this.data.modalName == 'lucky') {
      this.setData({
        modalName: ''
      })
    }
  },

  show_dialog: function () {
    this.setData({
      Withdrawal_dialog: true
    })
  },

  
  changeInterested(e) {
    console.log(e)
    let val = Number(e.target.dataset.value) + 1
    this.setData({
      uninterested: val
    })
  },
  
  close_dialog(e){
    var that = this
    that.setData({
      Withdrawal_dialog: false,
    })
    if(e && e.currentTarget.dataset.type == '1'){
      that.create_poster('1')
    }
  },

  // create_poster: function () {
  //   var that = this
  //   that.close_dialog()
  //   wx.showLoading({
  //     title: '玩命生成中~',
  //   })
  //   var palette = new Card().palette()
  //   var user_info = that.data.user_info
  //   var lottery_info = that.data.lottery_info
  //   palette.views[1].url = user_info.avatarUrl || that.data.logo
  //   palette.views[2].text = user_info.nickName
  //   palette.views[3].text = '邀请你帮Ta助力抽奖'
  //   palette.views[4].url = lottery_info.photo
  //   palette.views[5].text = '@' + lottery_info.ads[0].name + ' 发起'
  //   palette.views[6].text = lottery_info.prizes[0].name + ' x' + lottery_info.prizes[0].num
  //   if (palette.views[6].text.length > 20) {
  //     palette.views[7].css.top = '780rpx'
  //   }
  //   if (lottery_info.is_countdown) {
  //     palette.views[7].text = lottery_info.start_time + ' 自动开奖'
  //   } else {
  //     palette.views[7].text = '满' + lottery_info.full_num + ' 人自动开奖'
  //   }
  //   palette.views[8].url = that.data.qr_code
  //   that.setData({
  //     poster_hidden: false,
  //     template: palette
  //   })
  // },

  enter_dev(){
    let that = this
    that.close_dialog()
    wx.navigateTo({
      url: '../adv/adv?lid=' + that.data.lottery_info.lid +'&type=1',
    })
  },

  getPhoneNumber: function (e) {
    var that = this
    var session_key = wx.getStorageSync('session_key')
    app.request({
      url: 'user/get_phone',
      method: 'post',
      data: {
        "iv": e.detail.iv,
        "encryptedData": e.detail.encryptedData,
        "session_key": session_key
      },
    }).then(res => {
      console.log('获取电话号码', res)
      if (res.err_code == 0) {
        // 
        that.setData({
          hasPhone: true
        })
      }
    })
  },

  hide_join_code: function () {
    this.setData({
      modalName: ''
    })
    if (this.data.lottery_info.need_phone) {
      wx.requestSubscribeMessage({
        tmplIds:['tNfknBuEuLABUztZYHIZiJC4ROwieovDRWYVElyAm-A','tNfknBuEuLABUztZYHIZiIxs5WrXRfkyyTVSyROc_bE','tNfknBuEuLABUztZYHIZiEKSXt1Ep3Cmb2IYOJOXu1o'],
        success(res) {},
        complete(res) {
          console.log(res);
        }
      })
    }
  },

  restTime: function () {
    var that = this
    var timeStamp = 1800
    var interval = setInterval(function () {
      timeStamp -= 1
      var countdown_min = parseInt(timeStamp / 60);
      var countdown_sec = parseInt(timeStamp % 60);
      that.setData({
        countdown_min: countdown_min,
        countdown_sec: countdown_sec
      })
      if (timeStamp <= 0) {
        clearInterval(interval)
      }
    }, 1000)
  },

  copy_wechat: function () {
    var that = this
    wx.setClipboardData({
      data: that.data.lottery_info.ads[0].wechat,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log('复制成功')
            wx.showToast({
              title: '复制成功',
            })
          }
        })
      }
    })
  },

  show_front: function () {
    this.setData({
      front: true,
    })
    var that = this
    setTimeout(function () {
      that.setData({
        show_front: true
      })
    }, 500)
  },

  hide_lucky: function () {
    this.setData({
      modalName: ''
    })
  },

  show_lucky: function () {
    this.setData({
      modalName: 'lucky'
    })
  },

  // 跳转小程序广告商
  enter_ad: function () {
    var that = this
    var ad_dict = that.data.lottery_info.new_ad_dict
    that.mini_navigate(ad_dict.name, '点击')
    wx.navigateToMiniProgram({
      appId: ad_dict.appid,
      path: ad_dict.pageUrl,
      success(res) {
        console.log('跳转小程序=>', res)
        that.mini_navigate(ad_dict.name, '跳转')

      },
      fail(res) {
        console.log(res)
      },
    })
  },

  tiaoguo: function () {
    this.setData({
      show_banner: false,
      show_loading: true,
    })
  },

  // 开屏跳转小程序
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

  // 赞助商发起活动，跳转赞助商小程序(当当)
  enter_dd: function () {
    this.mini_navigate('当当', '点击')
    var that = this
    wx.navigateToMiniProgram({
      appId: 'wx7bb576902363f4ff',
      path: 'pages/coupon/couponCenter?&ald_media_id=32593&ald_link_key=61611b243ad535d5&unionid=p-324867m-423-47-6',
      success(res) {
        that.mini_navigate('当当', '跳转')
        setTimeout(function () {
          app.request({
            url: 'lottery/draw',
            method: 'post',
            data: {
              lid: that.data.lottery_info.lid,
              command: that.data.command || '',
            },
          }).then(res => {
            if (res.err_code == 0) {
              // that.setData({
              //   modalName: 'Join'
              // })
              // const data = that.get_lottery(that.data.lottery_info.lid)
              // if (data) {
              //   wx.navigateTo({
              //     url: '../success/success?code=' + res.data.winning_code_list[0],
              //   })
              // }
              wx.navigateTo({
                url: '../success/success?code=' + res.data.winning_code + '&lid=' + that.data.lottery_info.lid,
              })
              that.get_user()
              that.setData({
                winning_code: res.data.winning_code
              })
            } else {
              wx.showModal({
                title: '参加抽奖失败',
                content: '请长按删除小程序，重新进入参与抽奖',
                success(res) {
                  if (res.confirm) {}
                }
              })
            }
          })
        }, 3000)
      },
      fail(res) {
        console.log(res)
      },
    })
  },

  enter_mini: function () {
    this.mini_navigate('摄影大赛', '点击')
    var that = this
    wx.navigateToMiniProgram({
      appId: 'wxe57d6c9f14ad1056',
      path: 'pages/competition/competition?vid=5',
      success(res) {
        console.log('跳转投票助手小程序=>', res)
        that.mini_navigate('摄影大赛', '跳转')
      },
      fail(res) {
        console.log(res)
      },
    })
  },

  mini_navigate: function (url, status) {
    app.mini_navigate(url, status).then(res => {
      console.log(res)
    })
  },

  examine_comment: function (e) {
    var that = this
    app.request({
      url: 'lottery/show_comment',
      method: 'post',
      data: {
        cid: e.currentTarget.dataset.cid,
        lid: that.data.lottery_info.lid
      },
    }).then(res => {
      var comment_list = that.data.comment_list
      if (!comment_list[e.currentTarget.dataset.idx]["is_hot"]) {
        comment_list[e.currentTarget.dataset.idx]["is_hot"] = true
        comment_list.splice(e.currentTarget.dataset.idx, 1)
        wx.showToast({
          title: '已精选',
        })
      } else {
        comment_list[e.currentTarget.dataset.idx]["is_hot"] = false
        comment_list.splice(e.currentTarget.dataset.idx, 1)
        wx.showToast({
          title: '取消精选',
        })
      }
      that.setData({
        comment_list: comment_list
      })

    })
  },

  query_comment: function (lid, url) {
    var that = this
    if (that.data.examine) {
      var res_url = 'lottery/admin_get_comment'
    } else {
      var res_url = 'lottery/get_comment'
    }
    app.request({
      url: url || res_url,
      method: 'post',
      data: {
        lid: lid || that.data.lottery_info.lid,
      },
    }).then(res => {
      that.setData({
        comment_list: res.data.list
      })
    })
  },

  send_comment: function () {
    var that = this
    if (!that.data.is_auth) {
      return;
    }
    if (!that.data.content) {
      wx.showToast({
        title: '写点内容吧~',
      })
      return;
    }
    that.setData({
      disabled: true,
    })
    app.request({
      url: 'lottery/comment',
      method: 'post',
      data: {
        lid: that.data.lottery_info.lid,
        content: that.data.content,
        photos: []
      },
    }).then(res => {
      if (res.err_code == 0) {
        that.query_comment()
        that.setData({
          content: '',
          modalName: '',
          disabled: false,
        })
        wx.showToast({
          title: '留言成功待审核',
        })
      }
    })
  },

  send_reply: function () {
    var that = this
    if (!that.data.is_auth) {
      return;
    }
    if (!that.data.reply_content) {
      wx.showToast({
        title: '写点内容吧~',
      })
      return;
    }
    that.setData({
      disabled: true,
    })
    app.request({
      url: 'lottery/reply',
      method: 'post',
      data: {
        cid: parseInt(that.data.reply_cid),
        content: that.data.reply_content,
        photos: []
      },
    }).then(res => {
      if (res.err_code == 0) {
        that.query_comment()
        that.setData({
          reply_content: '',
          modalName: '',
          disabled: false,
        })
        wx.showToast({
          title: '回复成功待审核',
        })
      }
    })
  },

  show_comment: function () {
    this.setData({
      modalName: 'comment'
    })
  },

  show_reply: function (e) {
    this.setData({
      modalName: 'reply',
      reply_cid: e.detail
    })
  },

  content_input: function (e) {
    this.setData({
      content: e.detail.value
    })
  },

  reply_input: function (e) {
    this.setData({
      reply_content: e.detail.value
    })
  },

  switch_examine: function (e) {
    if (e.detail) {
      this.query_comment(this.data.lottery_info.lid, 'lottery/admin_get_comment')
    } else {
      this.query_comment(this.data.lottery_info.lid, 'lottery/get_comment')
    }
    this.setData({
      examine: e.detail
    })
  },

  cantmove: function () {
    return;
  },

  show_state: function () {
    this.setData({
      modalName: 'state'
    })
  },

  preview: function (e) {
    wx.previewImage({
      current: this.data.lottery_info.introduce_pic[e.currentTarget.dataset.idx],
      urls: this.data.lottery_info.introduce_pic,
    })
  },

  command_input: function (e) {
    this.setData({
      command: e.detail.value
    })
  },

  enter_index: function () {
    wx.reLaunch({
      url: '../index/index?show=1',
    })
  },

  show_gif: function () {
    var that = this
    that.setData({
      show_gif: true,
    })
    app.request({
      url: 'lottery/get_my_status',
      method: 'post',
      data: {
        lid: that.data.lottery_info.lid,
      },
    }).then(res => {
      that.setData({
        result_info: res.data,
      })
      setTimeout(function () {
        that.setData({
          show_result: true
        })
      }, 1000)
    })
  },

  enter_report: function () {
    var lottery_info = this.data.lottery_info
    var title = lottery_info.prizes[0].name + ' x' + lottery_info.prizes[0].num
    wx.navigateTo({
      url: '../report/report?lid=' + lottery_info.lid + '&title=' + title
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

  // admin: function(){

  // },

  create_poster: function (e) {
    console.log(e)
    var that = this
    wx.showLoading({
      title: '玩命生成中~',
    })
    var palette = new Card().palette()
    var user_info = that.data.user_info
    var lottery_info = that.data.lottery_info
    palette.views[1].url = user_info.avatarUrl || that.data.logo
    palette.views[2].text = user_info.nickName
    palette.views[3].text = e == '1' ? '邀请你参与抽奖' :'邀请你帮Ta助力抽奖'
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
  },

  onImgOK(e) {
    var that = this
    wx.hideLoading();
    var imagePath = e.detail.path;
    that.setData({
      imagePath: imagePath
    })
  },

  hide_modal: function () {
    console.log('111')
    this.setData({
      poster_hidden: true,
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

  get_lottery_code: function (lid) {
    var that = this
    app.request({
      url: 'lottery/get_share',
      method: 'post',
      data: {
        uid: parseInt(wx.getStorageSync('user_id')),
        lid: lid || that.data.lottery_info.lid,
        page: 'pages/lottery/lottery',
        is_hyaline: true
      },
    }).then(res => {
      that.setData({
        lottery_code: res.data.url
      })
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
              title: '已填写等待发货',
            })
          }
        })
      }
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

  show_winner: function () {
    wx.navigateTo({
      url: '../list/list?lid=' + this.data.lottery_info.lid,
    })
  },

  help: function (lid, uid) {
    var that = this
    app.request({
      url: 'lottery/help',
      method: 'post',
      data: {
        lid: parseInt(lid),
        uid: parseInt(uid),
        from_uid: parseInt(wx.getStorageSync('user_id')),
      },
    }).then(res => {
      console.log('助力', res)
    })
  },

  show_code: function () {
    this.setData({
      modalName: 'Image'
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  onGotUserInfo: function (e) {
    var that = this
    var userInfo = e.detail.userInfo
    console.log(userInfo)
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
    }
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

  enter_lottery: function (e) {
    wx.navigateTo({
      url: '../lottery/lottery?lid=' + e.currentTarget.dataset.lid,
    })
  },

  join_lottery: function () {
    var that = this
    // 抽奖结果通知、抽奖结果通知、抽奖结果通知
    if (app.globalData.miniName == '快点抽个奖') {
      wx.requestSubscribeMessage({
        tmplIds: ['Nswg2ITa1S5zHDos6bN2Jz-2vOfvREBEm-tNm5LN6V8', 'Nswg2ITa1S5zHDos6bN2J1LQH7dSeOtYVAAwa1yk4Po', 'Nswg2ITa1S5zHDos6bN2JzDZqZHGWEFr_nanvvQ5AfE'],
        success(res) {},
        complete(res) {
          console.log(res);
        }
      })
    } else {
      wx.requestSubscribeMessage({
        tmplIds:['tNfknBuEuLABUztZYHIZiJC4ROwieovDRWYVElyAm-A','tNfknBuEuLABUztZYHIZiIxs5WrXRfkyyTVSyROc_bE','tNfknBuEuLABUztZYHIZiEKSXt1Ep3Cmb2IYOJOXu1o'],
        success(res) {},
        complete(res) {
          console.log(res);
        }
      })
    }
    if (that.data.lottery_info.need_command) {
      if (!that.data.command) {
        that.setData({
          modalName: 'DialogModal1'
        })
        return;
      }
    }
    if (that.data.lottery_info.has_sponsor) {
      that.setData({
        modalName: 'zanzhu'
      })
      return;
    }
    that.setData({
      modalName: ''
    })
    app.request({
      url: 'lottery/draw',
      method: 'post',
      data: {
        lid: that.data.lottery_info.lid,
        command: that.data.command || '',
      },
    }).then(res => {
      if (res.err_code == 0) {
        
        wx.navigateTo({
          url: '../success/success?code=' + res.data.winning_code + '&lid=' + that.data.lottery_info.lid,
        })
        
        that.get_user()
        that.setData({
          winning_code: res.data.winning_code
        })
      } else {
        wx.showModal({
          title: '参加抽奖失败',
          content: '请长按删除小程序，重新进入参与抽奖',
          success(res) {
            if (res.confirm) {}
          }
        })
      }
    })
  },

  onShareAppMessage: function (res) {
    var that = this
    var userInfo = that.data.userInfo
    console.log('pages/lottery/lottery?lid=' + that.data.lottery_info.lid + '&share=1&uid=' + wx.getStorageSync('user_id'))
    return {
      title: that.data.user_info.nickName + '邀请你免费抽取' + that.data.lottery_info.prizes[0].name + 'x' + that.data.lottery_info.prizes[0].num,
      path: 'pages/lottery/lottery?lid=' + that.data.lottery_info.lid + '&share=1&uid=' + wx.getStorageSync('user_id'),
      imageUrl: that.data.lottery_info.introduce_pic[0],
      success: function (res) {

      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})