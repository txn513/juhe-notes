let util = require('../../utils/util.js')
const app = getApp()
let MyTableObject = new wx.BaaS.TableObject(app.globalData.tableID);

Page({
  data: {
    notesList: [],
    listLen: 0,
    loaded: false,
    tabbar: {},
    isIphoneX: app.globalData.systemInfo.model.includes("iPhone X"),
    itemLeft: 0,
    moveIdx: 0,
    deleteBtnWidth: 0,
    preventScroll: false,
    preventMove: false,
    addAnimation: false,
    containerHeight: 0,
    pageNum: 0, // 分页数
    numPerPage: 20, // 每页条数
    totalCount: 0,  // 总条数
    tempDelObj: {},
    tempDelNum: 0,
    showMask: false,

    //控制弹出选项
    isMarked: false,
    isTaged: false
  },
  onLoad(options){
    let that = this;
    app.editTabbar();
    app.hidetabbar();
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        that.setData({
          deleteBtnWidth: res.windowWidth/750*150,
          containerHeight: res.windowHeight
        })
      }
    })

    if (options.isShared == '1') {
      wx.navigateTo({
        url: '/pages/index/index?id=' + options.noteID + '&isShared=1' + '&userID=' + app.globalData.userID,
      })
      return;
    }
  },
  goAddTag(){ // tag
    app.globalData.insertNoteId = this.noteID;
    wx.switchTab({
      url: '../tags/tags'
    })
    this.setData({
      showMask: false
    })
  },
  showTagNMark(e){  // 显示功能弹窗
    console.log(e)
    this.noteID = e.currentTarget.dataset.id;
    this.tagId = e.currentTarget.dataset.tagid;
    this.mark = e.currentTarget.dataset.mark;
    this.noteTitle = e.currentTarget.dataset.notetitle;

    if (this.mark == '1') {
      this.setData({
        isMarked: true
      })
    } else {
      this.setData({
        isMarked: false
      })
    }
    this.setData({
      showMask: true
    })
  },
  hideMask(){
    this.setData({
      showMask: false
    })
  },
  goMark(e){   // 收藏或取消
    console.log(this.noteID)
    let Note = MyTableObject.get(this.noteID)
    Note.then(res => {
      let note = MyTableObject.getWithoutData(this.noteID)
      if (this.data.isMarked) { // 取消收藏
        note.set({
          'mark': 0,
        })
        note.update().then(res => {
          wx.showToast({
            title: '取消成功',
            icon: 'success'
          })
          this.getAllNotesAsync(1)
          app.globalData.markListRefreshFlag = true
        }, err => {
          wx.showToast({
            title: '收藏失败',
            icon: 'success'
          })
        })
      } else {

        note.set('mark', 1)
        note.update().then(res => {
          wx.showToast({
            title: '收藏成功',
            icon: 'success'
          })
          this.getAllNotesAsync(1)
          app.globalData.markListRefreshFlag = true
        }, err => {
          wx.showToast({
            title: '收藏失败',
            icon: 'success'
          })
        })
      }
    })
    
    
    this.setData({
      showMask: false
    })
  },
  getAllNotesAsync(reset){
    if (app.globalData.userID) {
      this.getAllNotes(reset)
    } else {
      app.userCallback = userId => {
        if (userId) {
          this.getAllNotes(reset)
        }
      }
    }
  },
  // 获取便签列表
  getAllNotes(reset){
    util.showBusy()
    let that = this;
    // let tableID = 41764;
    // let MyTableObject = new wx.BaaS.TableObject(tableID)
    let query = new wx.BaaS.Query()
    let id = getApp().globalData.userID

    if (reset && reset == 1) {
      this.reset()
    }
    query.compare('created_by', '=', id)
    // let contentEndString = wx.getStorageSync('contentEndString')

    MyTableObject.setQuery(query).orderBy(['-modified_at', '-created_at']).limit(this.data.numPerPage).offset(this.data.numPerPage * this.data.pageNum - this.data.tempDelNum).find().then(res => {
      // success
     
      let list = res.data.objects;
      list.forEach((value, index, arr) => {
        // arr[index]['created_at'] = new Date(arr[index]['created_at'] * 1000).toLocaleString()
        let todayDate = new Date()
        let todayYear = todayDate.getFullYear();
        let todayMonth = todayDate.getMonth();
        let todayDay = todayDate.getDay()
        if (arr[index]['modified_at']) {
          let getDate = new Date(arr[index]['modified_at'])
          if (todayYear == getDate.getFullYear() && (todayMonth == getDate.getMonth()) && todayDay == getDate.getDay()) {
            arr[index]['modified_at'] = util.formatTime(new Date(arr[index]['modified_at'])).hourOnly
          } else {
            arr[index]['modified_at'] = util.formatTime(new Date(arr[index]['modified_at'])).yearOnly
          }
        } else {
          let getDate = new Date(arr[index]['created_at'] * 1000)
          if (todayYear == getDate.getFullYear() && (todayMonth == getDate.getMonth()) && todayDay == getDate.getDay()) {
            arr[index]['created_at'] = util.formatTime(new Date(arr[index]['created_at'] * 1000)).hourOnly
          } else {
            arr[index]['created_at'] = util.formatTime(new Date(arr[index]['created_at'] * 1000)).yearOnly
          }
        }
        
       
        arr[index]['title'] = util.getNoteTitle(arr[index]['content'],0)
        arr[index]['subTitle'] = util.getNoteTitle(arr[index]['content'], 1)
      });

      if (reset && reset == 1) {
        this.setData({
          notesList: list,
          listLen: list.length
        });
      } else {
        this.setData({
          notesList: this.data.notesList.concat(list),
          listLen: this.data.notesList.concat(list).length
        });
      }

      this.setData({
        totalCount: res.data.meta.total_count,
        loaded: true
      });
      
      //---------
      app.globalData.listRefreshFlag = false
      wx.hideLoading()
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, err => {
      console.log(err)
      wx.hideLoading()
      // err
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      wx.showToast({
        title: '网络异常',
        icon: 'none',
        duration: 2000
      })
    })
  },
  // 新建便签
  createNew(){  
    wx.navigateTo({
      url: '../index/index'
    })
  },
  // 跳转详情
  goToDetail(e){
    console.log(e)
    wx.navigateTo({
      url: '../index/index?id=' + e.currentTarget.dataset.id
    })
  },

  //滑动
  itemTouchStart(e) { 
    let { itemLeft,moveIdx} = this.data;
    let index = e.currentTarget.dataset.index;
    
    if (moveIdx != index) {
      this.setData({
        // moveIdx: index,
        itemLeft: 0
      })
    }
    this.canMove = false;
    this.setData({
      moveIdx: index,
      preventScroll: false,
      preventMove: false,
    })
    
    this.startX = e.touches[0].clientX + this.data.itemLeft;
    this.startY = e.touches[0].clientY
    
  },
  itemTouchMove(e) { 
    
    let dis = this.startX - e.touches[0].clientX
    let disY = this.startY - e.touches[0].clientY
    // console.log(dis)

    if (Math.abs(disY) < 6 || this.canMove) {
      // console.log(111111)
      if (Math.abs(dis) <= this.data.deleteBtnWidth && dis > 4) {
        this.canMove = true
        this.setData({
          addAnimation: false,
          preventScroll: true,
          preventMove: false,
          itemLeft: dis,
        })
        
      }
      
    } else if(Math.abs(disY) >= 6 && !this.canMove){
      // console.log(222222)
      this.canMove = false;
      this.setData({
        preventMove: true,
        preventScroll: false
      })
    } 
    
  },
  itemTouchEnd(e) { 
    let { deleteBtnWidth, itemLeft } = this.data;
    let half = deleteBtnWidth/2
    this.setData({
      addAnimation: true
    })
    if (itemLeft < half) {
      this.setData({
        itemLeft: 0,
        preventScroll: false
      })
    } else {
      this.setData({
        itemLeft: deleteBtnWidth,
        preventScroll: false
      })
    }
    
  },
  preventScroll(){

  },

  deleteNote(e) {
    let that = this;
    let noteID = e.currentTarget.dataset.id;
    let idx = e.currentTarget.dataset.index;
    let { tempDelObj, tempDelNum } = this.data;
    console.log(noteID)
    wx.showModal({
      title: '提示',
      content: '确认删除？',
      cancelText: '取消',
      confirmText: '确定',
      success: function (res) {
        if (res.confirm) {
          MyTableObject.delete(noteID).then(res => {
            // success
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            console.log(idx)
            app.globalData.listRefreshFlag = true
            tempDelObj[idx] = true
            // that.getAllNotes()
            that.setData({
              itemLeft: 0,
              tempDelObj,
              tempDelNum: tempDelNum + 1
            })
          }, err => {
            // err
            wx.showToast({
              title: '网络异常',
              icon: 'none',
              duration: 2000
            })
          })
        } else if (res.cancel) {

        }
      }
    })

  },

  reset(){
    this.setData({
      notesList: [],
      tempDelObj: {},
      pageNum: 0,
      tempDelNum: 0
    })
  },
  onShow() {
    console.log('index.js')
    if (!app.globalData.listRefreshFlag) {
      return;
    }
    setTimeout(() => {
      this.getAllNotesAsync(1)
      
    }, 300)
  },
  onPullDownRefresh(){
    this.getAllNotesAsync(1)
  },
  onReachBottom(){
    let { pageNum, totalCount, numPerPage} = this.data; 
    // 到达最后一页
    if (Math.floor(totalCount / numPerPage) < (pageNum+1)) {
      return
    }
    this.setData({
      pageNum: this.data.pageNum + 1
    })
    this.getAllNotesAsync()
  },
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.noteTitle,
      path: 'pages/allMyNotes/allMyNotes?noteID=' + this.noteID + '&isShared=1',
      imageUrl: '/images/share-note.png'
    }
  }
  
})