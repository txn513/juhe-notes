// pages/my/myt.js
// const template = require('../template/template.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabbar: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // template.tabbar("tabBar", 2, this)//0表示第一个tabbar
    app.editTabbar();
    app.hidetabbar();
  },  

  goTo(e) {
    let url = e.currentTarget.dataset.url;
    wx.switchTab({
      url
    })
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
    app.globalData.addNoteMode = ''
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
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: 'TT便签-一个极简便签小程序',
      path: '/pages/allMyNotes/allMyNotes',
      imageUrl: '/images/share-note.png'
    }
  },
})