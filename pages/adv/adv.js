// pages/adv/adv.js
import Card from '../../palette/card';
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lid: 24,
    poster_hidden: true,
    is_hide:false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.type){
      this.setData({
        is_hide:true
      })
    }
    this.setData({
      lid: options.lid
    })
    this.get_lottery(options.lid)
    this.get_user()
    this.get_lottery_code(options.lid)
  },

  get_lottery: function (lid) {
    var that = this
    app.request({
      url: 'lottery/get',
      method: 'post',
      data: {
        lid: lid
      },
    }).then(res => {
      wx.hideLoading()
      that.setData({
        lottery_info: res.data
      })
    })
  },

  copy_img: function(){
    var that = this
    wx.downloadFile({
      url: that.data.lottery_info.photo,
      success(res) {
        console.log('==', res)
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: (res) => {
              wx.showToast({
                title: '已保存',
              })
            }, fail(e) {
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
          })
        }
      }
    })
    
  },

  copy_appid: function () {
    wx.setClipboardData({
      data: 'wx0e079ae3cc6a2c8c',
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

  copy_path: function () {
    wx.setClipboardData({
      data: 'pages/lottery/lottery?lid=' + this.data.lottery_info.lid,
      success(res) {
        wx.getClipboardData({
          success(res) {
            wx.showToast({
              title: '复制成功',
            })
          }
        })
      }
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
    palette.views[4].url = lottery_info.photo
    palette.views[5].text = '@' + lottery_info.ads[0].name + ' 发起'
    palette.views[6].text = lottery_info.prizes[0].name + ' x' + lottery_info.prizes[0].num
    if(palette.views[6].text.length > 20){
      palette.views[7].css.top = '780rpx'
    }
    if (lottery_info.is_countdown){
      palette.views[7].text = lottery_info.start_time + ' 自动开奖'
    }else{
      palette.views[7].text = '满' + lottery_info.full_num + ' 人自动开奖'
    }
    palette.views[8].url = that.data.lottery_code
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
      }, fail() {
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

  get_lottery_code: function(lid){
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
    }).then(res=>{
      that.setData({
        lottery_code: res.data.url
      })
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
})