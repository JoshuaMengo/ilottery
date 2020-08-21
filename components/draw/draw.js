// components/draw/draw.js
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
   },

   /**
    * 组件的方法列表
    */
   methods: {
      enter_paper(){
         wx.navigateTo({
           url: '../../pages/paper_edit/paper_edit',
         })
      },
      enter_edit(){
         wx.navigateTo({
            url: '../../pages/edit/edit',
          })
      }
      
   }
})
