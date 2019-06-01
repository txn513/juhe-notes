// miniprogram/pages/newTag/newTag.js
let util = require('../../utils/util.js')
const app = getApp()
let MyTableObject = new wx.BaaS.TableObject(app.globalData.tagTableID);

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:  '',
    list: [],
    isIphoneX: app.globalData.systemInfo.model.includes("iPhone X"),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData.tagTableID)
  },
  getName(e){
    let title = e.detail.value

    this.setData({
      title
    })
    
  },
  submit() {
    let that = this;
    let Tag = MyTableObject.create(); // 创建一条记录


    Tag.set({
      title: that.data.title
    }).save().then(res => {
      // success
      wx.showToast({
        title: '新建成功',
        icon: 'success'
      })
      app.globalData.tagListRefreshFlag = true
      wx.navigateBack({
        
      })      
      console.log(res)
    }, err => {
      //err 为 HError 对象
    })
    // if (!app.globalData.tagAddNewNInsert) { // 只新增


    // } else { // 新增并加入便签


    //   app.globalData.tagAddNewNInsert = false
    // }

  },
  
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.getTagLists()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})