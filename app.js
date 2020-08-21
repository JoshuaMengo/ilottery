//app.js
App({
  onLaunch: function () {
    this.getSession();
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        this.globalData.CustomBar = e.platform == 'android' ? e.statusBarHeight + 50 : e.statusBarHeight + 45;
      }
    })

    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log('是否有最新版本',res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
  },

  onHide: function(){
    let _this = this
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success(res) {
              console.log(res)
              _this.request({
                url: 'user/set',
                method: 'post',
                data: {
                  nickName: res.userInfo.nickName,
                  gender: res.userInfo.gender,
                  avatarUrl: res.userInfo.avatarUrl,
                },
              }).then(res => {
                console.log('更新用户信息')
              })
              _this.request({
                url: 'user/get_unionid',
                method: 'post',
                data: {
                  iv: res.iv,
                  encryptedData: res.encryptedData,
                  session_key: wx.getStorageSync('session_key') ,
                },
              }).then(res => {
                console.log('更新用户信息')
              })
            }
          })
        }
      }
    })
  },

  // 记录小程序跳转次数
  mini_navigate: function(jumpUrl, status){
    var that = this
    return new Promise((resolve, reject) => {
      that.request({
        url: 'lottery/record_status',
        method: 'POST',
        data: {
          "jumpUrl": jumpUrl || '',
          "status": status || '点击'
        }
      }).then(res => {
        if (res.err_code == 0) {
          resolve(res)
        }
      }, resolve)
    })
  },

  judge_admin: function () {
    let _this = this;
    return new Promise((resolve, reject) => {
      _this.request({
        url: 'admin_user/admin_judge',
        method: 'POST',
        data: {
          "uid": wx.getStorageSync('user_id')
        }
      }).then(res => {
        resolve(res)
      })
    })
  },

  judge_perm: function (lid) {
    let _this = this;
    return new Promise((resolve, reject) => {
      _this.request({
        url: 'lottery/judge_perm',
        method: 'POST',
        data: {
          "lid": parseInt(lid)
        }
      }).then(res => {
        resolve(res)
      })
    })
  },

  // 发送订阅消息
  send_subscribe: function (uid, tid, value, page) {
    let _this = this;
    return new Promise((resolve, reject) => {
      _this.request({
        url: 'social/push_templates',
        method: 'POST',
        data: {
          uid: uid,
          tid: tid,
          value: value,
          page: page,
        },
      }).then(res => {
        resolve(res)
      })
    })
  },

  /**
   * 封装支付接口
   */
  zhifu_request: function (args) {
    var baseUrl = 'https://pay.needyoutd.com/?s=index/order/'
    return new Promise((resolve, reject) => {
      wx.request({
        url: baseUrl + args.url,
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded'
        },
        data: args.data,
        success(res) {
          console.log('发起支付')
          resolve(res.data)
        },
        fail(err) {
          reject({
            err: err
          })
        }
      })
    })
  },


  /**
   * 处理svr返回
   */
  onSvrResp: function (resp) {
    return new Promise((resolve, reject) => {
      if (resp.statusCode != 200) {
        console.log(resp);
        return;
      }
      // console.log(resp.data);
      if (resp.data.err_code == 0) {
        resolve(resp.data);
      } else {
        // 显示错误信息
        console.log(resp)
        resolve('err')
      }
    })
  },

  /**
   * 保存session
   */
  setSession: function (session) {
    this.globalData.session = session;
  },

  /**
   * 获取session
   */
  getSession: function () {
    let _this = this;
    return new Promise((resolve, reject) => {
      let hasSession = true;
      let session = _this.globalData.session;
      if (typeof session == "undefined" || session == null || session == "") {
        hasSession = false;
      }
      if (hasSession) {
        // 已经有session
        resolve(session)
        return;
      }
      // 登录
      wx.login({
        success: res => {
          wx.request({
            url: _this.globalData.svrUrl + 'user/login?code=' + res.code,
            method: 'GET',
            success: function (resp) {
              _this.onSvrResp(resp).then(resp_data => {
                var session_key = resp_data.data.session_key || ''
                wx.setStorageSync('session_key', session_key)
                var user_id = resp_data.data.user_id
                wx.setStorageSync('user_id', resp_data.data.user_id)
                var session = resp_data.data.session;
                wx.setStorageSync('session', session)
                _this.setSession(session);
                resolve(session)
              }, reject)
            }
          })
        },
        fail: err => {
          console.log(err);
          reject(err)
        }
      })
    })
  },

  /**
   * 服务器请求
   */
  request: function (args) {
    let _this = this;
    console.log(args);
    return new Promise((resolve, reject) => {
      _this.getSession().then(session => {
        let req_url = _this.globalData.svrUrl + args.url + '?session=' + session;
        if (args.url.indexOf("?") != -1) {
          req_url = _this.globalData.svrUrl + args.url + '&session=' + session;
        }
        wx.request({
          url: req_url,
          data: args.data,
          method: args.method,
          success: res => {
            _this.onSvrResp(res).then(resolve, reject)
          },
          fail: err => {
            console.error(`wx.request fail`, err)
            reject({
              err: err
            })
          }
        })
      }, reject)
    })
  },

  /**
   * 上传图片
   */
  uploadImg: function (img) {
    let _this = this;
    return new Promise((resolve, reject) => {
      _this.getSession().then(session => {
        wx.uploadFile({
          url: _this.globalData.svrUrl + 'file/upload_image?session=' + session,
          filePath: img,
          name: 'image',
          method: 'POST',
          success: res => {
            if (res.statusCode != 200) {
              console.log(res);
              return;
            }
            console.log(res.data);
            var resp_data = JSON.parse(res.data);
            if (resp_data.err_code == 0) {
              resolve(resp_data);
            } else {
              // 显示错误信息
              wx.showModal({
                showCancel: false,
                content: resp_data.err_msg,
              })
              reject(resp_data)
            }
          },
          fail: err => {
            console.log(err);
            reject(err)
          }
        })
      })
    })
  },

  /**
   * 全局数据
   */
  globalData: {
    userInfo: '',
    svrUrl: "https://cyc.72needyou.cn/cj/",
    // svrUrl: "https://cjzs.lodidc.cn/new_raffle/",     // 抽个奖助手
    // svrUrl: "https://lottery.72needyou.cn/raffle/",   // 快点抽个奖
    
    miniName: '抽个奖助手', 
    // miniName: '快点抽个奖',
    appid: 'wx0e079ae3cc6a2c8c',
    // appid: 'wx4335a9cc78a220c6',  // 抽个奖助手
    // appid: 'wx9130919f6fc66e7f',  // 快点抽个奖
    session: "",
    showName: "单身相亲",
    school_list: []
  }
})
