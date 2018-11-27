//app.js
// var qcloud = require('./vendor/wafer2-client-sdk/index')
// var config = require('./config')s
App({
  globalData: {
    userID: '',
    tableID: 41764
  },
    onLaunch: function () {
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
    }
})