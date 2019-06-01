//app.js
// var qcloud = require('./vendor/wafer2-client-sdk/index')
// var config = require('./config')
let util = require('./utils/util.js');
App({
  editTabbar: function () {
    let tabbar = this.globalData.tabBar;
    let currentPages = getCurrentPages();
    let _this = currentPages[currentPages.length - 1];
    let pagePath = _this.route;
    (pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath);
    for (let i in tabbar.list) {
      tabbar.list[i].selected = false;
      (tabbar.list[i].pagePath == pagePath) && (tabbar.list[i].selected = true);
    }
    _this.setData({
      tabbar: tabbar
    });
  },
  hidetabbar() {
    wx.hideTabBar({
      fail: function () {
        setTimeout(function () { // 做了个延时重试一次，作为保底。
          wx.hideTabBar()
        }, 500)
      }
    });
  },
  getSystemInfo: function () {
    let t = this;
    wx.getSystemInfo({
      success: function (res) {
        t.globalData.systemInfo = res;
      }
    });
  },
  globalData: {
    userID: '',
    tableID: 41764,//41764  75704
    tagTableID: 75652,
    tabBar: {
      "backgroundColor": "#ffffff",
      "color": "#979795",
      "selectedColor": "#1c1c1b",
      "list": [
        {
          "pagePath": "/pages/allMyNotes/allMyNotes",
          "iconPath": "icon/icon_home.png",
          "selectedIconPath": "icon/icon_home_HL.png",
          "text": "首页"
        },
        {
          "pagePath": "/pages/tags/tags",
          "iconPath": "icon/icon_tag.png",
          "selectedIconPath": "icon/icon_tag_HL.png",
          "text": "文件夹"
        },
        {
          "pagePath": "/pages/index/index",
          "iconPath": "icon/icon_release.png",
          "isSpecial": true,
          "text": "新建"
        },
        {
          "pagePath": "/pages/marks/marks",
          "text": "收藏",
          "iconPath": "icon/icon_mark.png",
          "selectedIconPath": "icon/icon_mark_HL.png",
        },
        {
          "pagePath": "/pages/my/my",
          "iconPath": "icon/icon_mine.png",
          "selectedIconPath": "icon/icon_mine_HL.png",
          "text": "我"
        }
      ]
    },
    fontSize: 34, // 字体大小
    listRefreshFlag: true, // 便签列表刷新标识
    tagAddNewNInsert: false, // 新建文件夹并插入便签，从移到文件夹按钮跳转则为true
    tagListRefreshFlag: true,
    tagListItemRefreshFlag: true,
    markListRefreshFlag: true,
    // addNoteInTag: false,
    addNoteMode: '', // 新增便签模式 空-全局, tag-标签, mark-收藏
  },
    onLaunch: function (options) {
      if (!wx.cloud) {
        console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      } else {
        wx.cloud.init({
          traceUser: true,
        })
      }
      // util.getOpenid(this)



      //--------------------------
      // this.hidetabbar();
      this.getSystemInfo()
      require('./utils/sdk-v1.9.1.js')
      // 初始化 SDK
      let clientID = '957f296cd1c011222319'
      wx.BaaS.init(clientID)

     
      // 微信用户登录小程序
      wx.BaaS.login(false).then(res => {
        // 登录成功
        console.log(res)
        this.globalData.userID = res.id
        // console.log(this.globalData.userID)
        if (this.userCallback) {
          this.userCallback(res.id)
        }
      }, res => {
        // 登录失败
      })

      
        // qcloud.setLoginUrl(config.service.loginUrl)
    },
    onShow(options){
      console.log(options)
    }
})