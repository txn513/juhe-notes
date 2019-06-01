//index.js
// var qcloud = require('../../vendor/wafer2-client-sdk/index')
// var config = require('../../config')
var util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        userInfo: {},
        logged: false,
        takeSession: false,
        requestResult: '',
        content: '',
        isFocus: false,
        taHeight: 0,
        isEditFlag: false,
        noteID: '',
        initCon: '', // 初始内容 - 用来对比修改内容
      isShared: false,
      animationData: {},
      toolsWidth: 0, //工具栏宽度
      arrowWrapWidth: 0, //
      conNotEmpty: false,
      toolExpand: false,
      tagName: '',
      tagId: ''
    },
    onLoad(options){
      // console.log(options)
      var that = this;

      wx.getSystemInfo({
        success: function(res) {
          console.log(res)
          that.setData({
            taHeight: res.windowHeight
          })
        }
      })

      if (options.tagName) {
        this.setData({
          tagName: options.tagName
        })
      }
      if (options.tagId) {
        this.setData({
          tagId: options.tagId
        })
      }
      //编辑模式
      if (options.id) {  
        this.setData({
          isEditFlag: true,
          noteID: options.id,
          conNotEmpty: true
        });
        wx.setNavigationBarTitle({
          title: '编辑便签',
        })
        this.getNoteDetail();
        wx.showShareMenu({
          withShareTicket: true
        })
      } else {//新建模式
        this.setData({
          isFocus: true
        })
      }

     if (options.isShared == 1) {
       this.setData({
         isShared: true
       })
       wx.setNavigationBarTitle({
         title: 'TT便签',
       })
       app.globalData.listRefreshFlag = true
     }


     // 动画初始化
      // this.initTool()
      
      
    },

    initTool(){
      const animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
      })
      this.animation = animation
      this.getToolsInfo().then(res => {
        // console.log(res)
        let toolsWidth = res[0].width
        let arrowWrapWidth = res[1].width
        this.setData({
          toolsWidth,
          arrowWrapWidth
        })
        // console.log(toolsWidth)
        animation.translateX(toolsWidth - arrowWrapWidth).step()
        animation.opacity(1).step()
        this.setData({
          animationData: animation.export()
        })
      })
    },
    // 获取工具相关尺寸
    getToolsInfo(){

      return new Promise((resolve, reject)=>{
        let query = wx.createSelectorQuery()
        query.select('.tools').boundingClientRect();
        query.select('.tools-item-1').boundingClientRect();
        query.exec(res => {
          resolve(res)
        })
      })


      

      // query.selectAll('.tools').boundingClientRect(rect => {
      //   console.log(rect)
      //   this.setData({
      //     toolsWidth: rect[0].width
      //   })
      // }).exec() 
      // query.selectAll('.tools-item-1').boundingClientRect(rect => {
      //   this.setData({
      //     arrowWrapWidth: rect[0].width
      //   })
      // }).exec()  
    },
    onShareAppMessage(){
      return {
        path: 'pages/allMyNotes/allMyNotes?noteID='+ this.data.noteID + '&isShared=1'
      }
    },
    blurTextArea(){
      // this.setData({
      //   isFocus: false
      // });
      this.uploadNote()
    },
    focusTextArea(){
      // this.setData({
      //   isFocus: true
      // });
    },
    getContent(e){
      // 输入空情况
      if (e.detail.value.replace(/\s+/g, '') == '') {
        this.setData({
          conNotEmpty: false
        })
        // return
      }

      this.setData({
        content: e.detail.value,
        conNotEmpty: true
      })

      
      // let pages = getCurrentPages();  //获取页面栈实例
      // let prePage = pages[pages.length - 2];
      // prePage.setData({
      //   needRefresh: true
      // })
    },

    //提交
    uploadNote(){
      //tableID: 39200
      
      let { content, isEditFlag, initCon} = this.data;
      // let storedList = wx.getStorageSync('notesList');

      // 输入空情况
      if (content.replace(/\s+/g, '') == '') {
        return
      }

      // 未作修改
      if (content == initCon){
        return;
      }

      this.setData({
        initCon: content
      })

      

      app.globalData.listRefreshFlag = true
      if (this.tagId) {
        app.globalData.tagListItemRefreshFlag = true
      }
      let conLen = content.length;
      let contentEndString = content.substring(conLen - 10, conLen)
      wx.setStorageSync('contentEndString', contentEndString)

      // 编辑模式
      if (isEditFlag) {
        this.updateEditedNote()
        return;
      }

      let tableID = 75704;
      let Notes = new wx.BaaS.TableObject(tableID);
      let note = Notes.create(); // 创建一条记录


      note.set({ 
        content,
        'tagId': this.data.tagId,
        'tagName': this.data.tagName,
      })
        .save()
        .then(res => {
          // success
          console.log(res)
          this.setData({
            isEditFlag: true,
            noteID: res.data._id,
            
          });
        }, err => {
          // err
        })


      // let pages = getCurrentPages();  //获取页面栈实例
      // let prePage = pages[pages.length - 2];
      // prePage.setData({
      //   needRefresh: true
      // })
      
    },
    userInfoHandler(data) {
      wx.BaaS.handleUserInfo(data).then(res => {
        // res 包含用户完整信息，详见下方描述
        // util.showBusy(res)
        console.log(res)
      }, res => {
        // **res 有两种情况**：用户拒绝授权，res 包含基本用户信息：id、openid、unionid；其他类型的错误，如网络断开、请求超时等，将返回 Error 对象（详情见下方注解）
        // *Tips*：如果你的业务需要用户必须授权才可进行，由于微信的限制，10 分钟内不可再次弹出授权窗口，此时可以调用 [`wx.openSetting`](https://mp.weixin.qq.com/debug/wxadoc/dev/api/setting.html) 要求用户提供授权
      })
    },


    //获取编辑函数
  getNoteDetail(id) {
    util.showBusy()
    let tableID = 75704;
    let MyTableObject = new wx.BaaS.TableObject(tableID)

    MyTableObject.get(this.data.noteID).then(res => {
      // success
      // console.log(res)
      let obj = res.data;
      obj['created_at'] = new Date(obj['created_at'] * 1000).toLocaleString();
      this.setData({
        noteObj: obj,
        content: obj.content,
        initCon: obj.content,
      });
      wx.hideLoading()
    }, err => {
      wx.hideLoading()
      // err
      wx.showToast({
        title: '网络异常',
        icon: 'none',
        duration: 2000
      })
    })
  },
  updateEditedNote() {
    let tableID = getApp().globalData.tableID;
    let MyTableObject = new wx.BaaS.TableObject(tableID);
    let MyRecord = MyTableObject.getWithoutData(this.data.noteID);
    let { content} = this.data;
    // console.log(this.data.noteID)
    
    MyRecord.set({
      'content': content
    })

    MyRecord.update().then(res => {
      console.log(res)
      // wx.showToast({
      //   title: '更新成功',
      //   icon: 'success'
      // })
      // success
    }, err => {
      // err
    })
  },

  // 
  toolsTap(){
    let { toolExpand } = this.data;
    if (!toolExpand) {
      this.toolsShow()
    } else {
      this.toolsHide()
    }
   
    
  },
  // 工具栏点击动画
  toolsShow(){
    let { toolsWidth, arrowWrapWidth } = this.data
    this.animation.translateX(0).step()
    this.setData({
      animationData: this.animation.export(),
      toolExpand: true
    })
  },
  toolsHide(){
    let { toolsWidth , arrowWrapWidth } = this.data
    this.animation.translateX(toolsWidth - arrowWrapWidth).step()
    this.setData({
      animationData: this.animation.export(),
      toolExpand: false
    })
  },

  preventScroll() {

  },

  onUnload(){
    // console.log('back')
    this.uploadNote()
   
  },

  onHide(){
    // console.log('hide')
    this.uploadNote()
  }



    // // 用户登录示例
    // login: function() {
    //     if (this.data.logged) return

    //     util.showBusy('正在登录')
    //     var that = this

    //     // 调用登录接口
    //     qcloud.login({
    //         success(result) {
    //             if (result) {
    //                 util.showSuccess('登录成功')
    //                 that.setData({
    //                     userInfo: result,
    //                     logged: true
    //                 })
    //             } else {
    //                 // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
    //                 qcloud.request({
    //                     url: config.service.requestUrl,
    //                     login: true,
    //                     success(result) {
    //                         util.showSuccess('登录成功')
    //                         that.setData({
    //                             userInfo: result.data.data,
    //                             logged: true
    //                         })
    //                     },

    //                     fail(error) {
    //                         util.showModel('请求失败', error)
    //                         console.log('request fail', error)
    //                     }
    //                 })
    //             }
    //         },

    //         fail(error) {
    //             util.showModel('登录失败', error)
    //             console.log('登录失败', error)
    //         }
    //     })
    // },

    // // 切换是否带有登录态
    // switchRequestMode: function (e) {
    //     this.setData({
    //         takeSession: e.detail.value
    //     })
    //     this.doRequest()
    // },

    // doRequest: function () {
    //     util.showBusy('请求中...')
    //     var that = this
    //     var options = {
    //         url: config.service.requestUrl,
    //         login: true,
    //         success (result) {
    //             util.showSuccess('请求成功完成')
    //             console.log('request success', result)
    //             that.setData({
    //                 requestResult: JSON.stringify(result.data)
    //             })
    //         },
    //         fail (error) {
    //             util.showModel('请求失败', error);
    //             console.log('request fail', error);
    //         }
    //     }
    //     if (this.data.takeSession) {  // 使用 qcloud.request 带登录态登录
    //         qcloud.request(options)
    //     } else {    // 使用 wx.request 则不带登录态
    //         wx.request(options)
    //     }
    // },

    // // 上传图片接口
    // doUpload: function () {
    //     var that = this

    //     // 选择图片
    //     wx.chooseImage({
    //         count: 1,
    //         sizeType: ['compressed'],
    //         sourceType: ['album', 'camera'],
    //         success: function(res){
    //             util.showBusy('正在上传')
    //             var filePath = res.tempFilePaths[0]

    //             // 上传图片
    //             wx.uploadFile({
    //                 url: config.service.uploadUrl,
    //                 filePath: filePath,
    //                 name: 'file',

    //                 success: function(res){
    //                     util.showSuccess('上传图片成功')
    //                     console.log(res)
    //                     res = JSON.parse(res.data)
    //                     console.log(res)
    //                     that.setData({
    //                         imgUrl: res.data.imgUrl
    //                     })
    //                 },

    //                 fail: function(e) {
    //                     util.showModel('上传图片失败')
    //                 }
    //             })

    //         },
    //         fail: function(e) {
    //             console.error(e)
    //         }
    //     })
    // },

    // // 预览图片
    // previewImg: function () {
    //     wx.previewImage({
    //         current: this.data.imgUrl,
    //         urls: [this.data.imgUrl]
    //     })
    // },

    // // 切换信道的按钮
    // switchChange: function (e) {
    //     var checked = e.detail.value

    //     if (checked) {
    //         this.openTunnel()
    //     } else {
    //         this.closeTunnel()
    //     }
    // },

    // openTunnel: function () {
    //     util.showBusy('信道连接中...')
    //     // 创建信道，需要给定后台服务地址
    //     var tunnel = this.tunnel = new qcloud.Tunnel(config.service.tunnelUrl)

    //     // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
    //     tunnel.on('connect', () => {
    //         util.showSuccess('信道已连接')
    //         console.log('WebSocket 信道已连接')
    //         this.setData({ tunnelStatus: 'connected' })
    //     })

    //     tunnel.on('close', () => {
    //         util.showSuccess('信道已断开')
    //         console.log('WebSocket 信道已断开')
    //         this.setData({ tunnelStatus: 'closed' })
    //     })

    //     tunnel.on('reconnecting', () => {
    //         console.log('WebSocket 信道正在重连...')
    //         util.showBusy('正在重连')
    //     })

    //     tunnel.on('reconnect', () => {
    //         console.log('WebSocket 信道重连成功')
    //         util.showSuccess('重连成功')
    //     })

    //     tunnel.on('error', error => {
    //         util.showModel('信道发生错误', error)
    //         console.error('信道发生错误：', error)
    //     })

    //     // 监听自定义消息（服务器进行推送）
    //     tunnel.on('speak', speak => {
    //         util.showModel('信道消息', speak)
    //         console.log('收到说话消息：', speak)
    //     })

    //     // 打开信道
    //     tunnel.open()

    //     this.setData({ tunnelStatus: 'connecting' })
    // },

    // /**
    //  * 点击「发送消息」按钮，测试使用信道发送消息
    //  */
    // sendMessage() {
    //     if (!this.data.tunnelStatus || !this.data.tunnelStatus === 'connected') return
    //     // 使用 tunnel.isActive() 来检测当前信道是否处于可用状态
    //     if (this.tunnel && this.tunnel.isActive()) {
    //         // 使用信道给服务器推送「speak」消息
    //         this.tunnel.emit('speak', {
    //             'word': 'I say something at ' + new Date(),
    //         });
    //     }
    // },

    // /**
    //  * 点击「关闭信道」按钮，关闭已经打开的信道
    //  */
    // closeTunnel() {
    //     if (this.tunnel) {
    //         this.tunnel.close();
    //     }
    //     util.showBusy('信道连接中...')
    //     this.setData({ tunnelStatus: 'closed' })
    // }
})
