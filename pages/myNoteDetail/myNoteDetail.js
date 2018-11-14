Page({
  data: {
    noteID: '',
    noteObj: {}
  },
  onLoad: function (option) {
    console.log(option.id)
    this.setData({
      noteID: option.id
    });
    this.getNoteDetail();
  },
  getNoteDetail(id){
    let tableID = 41764;
    let MyTableObject = new wx.BaaS.TableObject(tableID)

    // let query1 = new wx.BaaS.Query()
    // query1.compare('id', '=', this.data.noteID)
    // let query2 = new wx.BaaS.Query()
    // query2.compare('created_by', '=', getApp().globalData.userID)

    // let andQuery = wx.BaaS.Query.and(query1, query2)

    // MyTableObject.setQuery(andQuery).find().then(res => {
    //   // success
    //   console.log(res)
    //   let obj = res.data.objects[0];
    //   obj['created_at'] = new Date(obj['created_at']*1000).toLocaleString();
    //   this.setData({
    //     noteObj: obj
    //   });
    // }, err => {
    //   // err
    // })
    MyTableObject.get(this.data.noteID).then(res => {
      // success
      console.log(res)
      let obj = res.data;
      obj['created_at'] = new Date(obj['created_at']*1000).toLocaleString();
      this.setData({
        noteObj: obj
      });
    }, err => {
      // err
    })
  },
  deleteNote(){
    let MyTableObject = new wx.BaaS.TableObject(getApp().globalData.tableID);
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认删除？',
      cancelText: '取消',
      confirmText: '确定',
      success: function (res) {
        if (res.confirm) {
          MyTableObject.delete(that.data.noteID).then(res => {
            // success
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            wx.navigateBack({
              delta: 1
            })
          }, err => {
            // err
          })
        } else if (res.cancel) {

        }
      }
    })
    
  }
});