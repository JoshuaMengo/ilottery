const app = getApp()

Page({
   data: {
      files: [],
      // files: [{
      //    url: 'http://mmbiz.qpic.cn/mmbiz_png/VUIF3v9blLsicfV8ysC76e9fZzWgy8YJ2bQO58p43Lib8ncGXmuyibLY7O3hia8sWv25KCibQb7MbJW3Q7xibNzfRN7A/0',
      // }, {
      //    loading: true
      // }, {
      //    error: true
      // }],
      cell_tit: '上传banner图',
      cell_tit_btm: 'banner图管理',
      manage_type: '',
      appid: '',
      path: '',
      checkboxItems: [{
            name: 'standard is dealt for u.',
            value: '0',
            checked: true
         },
         {
            name: 'standard is dealicient for u.',
            value: '1'
         }
      ],
      items: [{
            value: 'USA',
            name: '美国'
         },
         {
            value: 'CHN',
            name: '中国',
            checked: 'true'
         },
         {
            value: 'BRA',
            name: '巴西'
         },
         {
            value: 'JPN',
            name: '日本'
         },
         {
            value: 'ENG',
            name: '英国'
         },
         {
            value: 'FRA',
            name: '法国'
         }
      ]
   },
   onLoad(options) {
      console.log(options, '0-0-0aaaa--=-')
      if (options.type == 'ad') {
         this.setData({
            cell_tit: '上传广告图',
            cell_tit_btm: '广告图管理',
            manage_type: options.type
         })
         this.query_ad()
      } else {
         this.query_banner()
      }

      this.setData({
         selectFile: this.selectFile.bind(this),
         uplaodFile: this.uplaodFile.bind(this)
      })

   },

   chooseImage: function (e) {
      var that = this;
      wx.chooseImage({
         sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
         sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
         success: function (res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            app.uploadImg(res.tempFilePaths.length).then(res => {
               that.setData({
                  files: res.tempFilePaths
               });
            })
         }
      })
   },

   previewImage: function (e) {
      wx.previewImage({
         current: e.currentTarget.id, // 当前显示图片的http链接
         urls: this.data.files // 需要预览的图片http链接列表
      })
   },
   selectFile(files) {
      console.log('files', files)
      // 返回false可以阻止某次文件上传
   },

   uplaodFile(files) {
      console.log('upload files', files)
      // 文件上传的函数，返回一个promise
      var that = this
      return new Promise((resolve, reject) => {
         // setTimeout(() => {
         //    reject('some error')
         // }, 1000)
         app.uploadImg(files.tempFilePaths[0]).then(res => {
            that.setData({
               files: [{
                  url: files.tempFilePaths[0]
               }]
            });
         })
      })
   },
   uploadError(e) {
      console.log('upload error', e.detail)
   },
   uploadSuccess(e) {
      console.log('upload success', e.detail)
   },

   checkboxChange: function (e) {
      let that =this
      console.log('checkbox发生change事件，携带value值为：', e.detail.value);
      if(that.data.manage_type == 'ad'){
         that.setData({
            aid:e.detail.value
         })
      }else{
         that.setData({
            bid:e.detail.value
         })
      }
      var checkboxItems = this.data.checkboxItems,
         values = e.detail.value;
      for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
         checkboxItems[i].checked = false;

         for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
            if (checkboxItems[i].value == values[j]) {
               checkboxItems[i].checked = true;
               break;
            }
         }
      }

      this.setData({
         checkboxItems: checkboxItems,
         [`formData.checkbox`]: e.detail.value
      });
   },

   query_banner() {
      var that = this
      app.request({
         url: 'lottery/query_banner',
         method: 'post',

      }).then(res => {
         that.setData({
            bannerList: res.data.list
         })
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

   setAppid(e) {
      console.log(e.detail.value)
      this.setData({
         appid: e.detail.value
      })
   },
   setPath(e) {
      console.log(e.detail.value)
      this.setData({
         path: e.detail.value
      })
   },
   setName(e) {
      console.log(e.detail.value)
      this.setData({
         name: e.detail.value
      })
   },
   setIntroduce(e) {
      console.log(e.detail.value)
      this.setData({
         introduce: e.detail.value
      })
   },
   setPageUrl(e) {
      console.log(e.detail.value)
      this.setData({
         pageUrl: e.detail.value
      })
   },
   delete_btn(){
      let that = this
      if(that.data.manage_type == 'ad'){
         // if(that.data.)
         if(that.data.aid.length > 1){
            wx.showToast({
              title: '一次只能选择一个进行删除',
            })
            return
         }
         app.request({
            url: 'lottery/delete_ad',
            method: 'post',
            data: {
               aid:that.data.aid[0]
            }
         }).then(res => {
            console.log(res)
            that.query_ad()
         })
      }else{
         if(that.data.bid.length > 1){
            wx.showToast({
              title: '一次只能选择一个进行删除',
            })
            return
         }
         app.request({
            url: 'lottery/delete_banner',
            method: 'post',
            data: {
               bid:that.data.bid[0]
            }
         }).then(res => {
            console.log(res)
            that.query_ad()
         })
      }
   },

   submit_banner() {
      var that = this
      if(that.data.manage_type == 'ad'){
         if (that.data.appid + '' == '' || that.data.path + '' == '' || that.data.name + '' == '' || that.data.introduce + '' == '') {
            wx.showToast({
               title: '请填写完整',
               icon: 'none'
            })
            return
         }
         app.request({
            url: 'lottery/set_ad',
            method: 'post',
            data: {
               img: that.data.files[0].url,
               addid: that.data.appid,
               path: that.data.path,
               name: that.data.name,
               introduce: that.data.introduce
            }
         }).then(res => {
            console.log(res)
            that.query_ad()
         })
      }else{
         if (that.data.appid + '' == '' || that.data.path + '' == '') {
            wx.showToast({
               title: 'appid和path不能为空',
               icon: 'none'
            })
            return
         }
         app.request({
            url: 'lottery/set_banner',
            method: 'post',
            data: {
               img: that.data.files[0].url,
               addid: that.data.appid,
               path: that.data.path
            }
         }).then(res => {
            console.log('设置banner', res)
            that.query_banner()
         })
      }
   }
});