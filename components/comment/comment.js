// components/comment/comment.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    comment_list: Array,
    is_admin: Boolean,
    examine: Boolean,
    lid: Number
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    examine_comment: function(e){
      var that = this
      app.request({
        url: 'lottery/show_comment',
        method: 'post',
        data: {
          cid: e.currentTarget.dataset.cid,
          lid: that.data.lid
        },
      }).then(res=>{
        var comment_list = that.data.comment_list
        if(!comment_list[e.currentTarget.dataset.idx]["is_hot"]){
          comment_list[e.currentTarget.dataset.idx]["is_hot"] = true
          comment_list.splice(e.currentTarget.dataset.idx, 1)
          wx.showToast({
            title: '已精选',
          })
        }else{
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

    query_comment: function(lid, url){
      var that = this
      app.request({
        url: url || 'lottery/admin_get_comment',
        method: 'post',
        data: {
          lid: lid,
        },
      }).then(res=>{
        that.setData({
          comment_list: res.data.list
        })
      })
    },
  
    send_comment: function(){
      var that = this
      if(!that.data.is_auth){
        return;
      }
      if(!that.data.content){
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
          lid: that.data.lid,
          content: that.data.content,
          photos: []
        },
      }).then(res=>{
        if(res.err_code == 0){
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

    show_comment: function(){
      this.triggerEvent('show_comment', 'comment')
    },
  
    show_reply: function(e){
      console.log('子组件111', e)
      this.triggerEvent('show_reply', e.currentTarget.dataset.cid)
      // this.setData({
      //   modalName: 'reply',
      //   reply_cid: e.currentTarget.dataset.cid
      // })
    },

    switch_examine: function(){ 
      // if(!this.data.examine){
      //   this.query_comment(this.data.lid, 'lottery/admin_get_comment')
      // }else{
      //   this.query_comment(this.data.lid, 'lottery/get_comment')
      // }
      // this.setData({
      //   examine: !this.data.examine
      // })
      this.triggerEvent('switch_examine', !this.data.examine)
    },
  }
})
