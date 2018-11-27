let util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    notesList: [],
    listLen: 0,
    loaded: false
  },
  onLoad(){
    if (app.globalData.userID) {
      this.getAllNotes()
    } else {
      app.userCallback = userId => {
        if (userId) {
          this.getAllNotes()
        }
      }
    }
  },
  onShow(){
    // 
  },
  getAllNotes(){
    util.showBusy()
    let tableID = 41764;
    let MyTableObject = new wx.BaaS.TableObject(tableID)
    let query = new wx.BaaS.Query()
    let id = getApp().globalData.userID
    query.compare('created_by', '=', id)

    MyTableObject.setQuery(query).orderBy('-created_at').find().then(res => {
      // success
      console.log(res)

      let list = res.data.objects;
      list.forEach(function(value, index, arr){
        arr[index]['created_at'] = new Date(arr[index]['created_at']*1000).toLocaleString()
      });

      this.setData({
        notesList: list,
        listLen: list.length,
        loaded: true
      });
      wx.hideLoading()
    }, err => {
      wx.hideLoading()
      // err
    })
  },
  navigateBack(){
    wx.navigateBack({
      delta: 1
    })
  },
  goToDetail(e){
    console.log(e)
    wx.navigateTo({
      url: '../myNoteDetail/myNoteDetail?id=' + e.currentTarget.dataset.id
    })
  }
})