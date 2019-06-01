let util = require('../../utils/util.js')
const app = getApp()
let MyTableObject = new wx.BaaS.TableObject(app.globalData.tagTableID);
let NotesTableObject = new wx.BaaS.TableObject(app.globalData.tableID);

Page({
  data: {
    tagList: [],
    loaded: false,

    notesList: [],
    listLen: 0,
    
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
    adError: false,
    adClose: false
    //更新参数
    // needRefresh: false,

  },
  adClose() {
    this.setData({
      addClose: true
    })
  },
  adError(err) {
    console.log(err)
    this.setData({
      adError: true
    })
  },
  onLoad(options) {
    let that = this;
    app.editTabbar();
    app.hidetabbar();
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        that.setData({
          deleteBtnWidth: res.windowWidth / 750 * 150,
          containerHeight: res.windowHeight
        })
      }
    })
    

    // if (options.isShared == '1') {
    //   wx.navigateTo({
    //     url: '/pages/index/index?id=' + options.noteID + '&isShared=1' + '&userID=' + app.globalData.userID,
    //   })
    //   return;
    // }
    // this.getAllListAsync()


    // this.loop();
  },

  onShow() {
    console.log(app.globalData.insertNoteId)
    if (app.globalData.insertNoteId) {
      app.globalData.tagAddNewNInsert = true
      // app.globalData.insertNoteId = null
    } else {
      app.globalData.tagAddNewNInsert = false
    }
    
    if (!app.globalData.tagListRefreshFlag) {
      return;
    }
    setTimeout(() => {
      this.reset()
      this.getAllListAsync()
    }, 300)
      // this.reset()
      // this.getAllListAsync()
  },

  getTagLists() {
    util.showBusy()
    let that = this;
    // let tableID = 41764;
    // let MyTableObject = new wx.BaaS.TableObject(tableID)
    let query = new wx.BaaS.Query()
    let id = getApp().globalData.userID
    query.compare('created_by', '=', id)
    MyTableObject.setQuery(query).orderBy('-created_at').limit(this.data.numPerPage).offset(this.data.numPerPage * this.data.pageNum - this.data.tempDelNum).find().then(res => {
      let list = res.data.objects;
      this.setData({
        tagList: this.data.tagList.concat(list),
        loaded: true,
        listLen: this.data.tagList.concat(list).length,
        totalCount: res.data.meta.total_count,
      })

      // app.globalData.listRefreshFlag = false
      app.globalData.tagListRefreshFlag = false
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
  getAllListAsync() {
    if (app.globalData.userID) {
      this.getTagLists()
    } else {
      app.userCallback = userId => {
        if (userId) {
          this.getTagLists()
        }
      }
    }
  },
  
  
  createNew() {  // ------------------
    wx.navigateTo({
      url: '../newTag/newTag'
    })
  },
  // 跳转详情
  goToDetail(e) {   // ------------------------
    console.log(e)
    console.log('是否插入', app.globalData.insertNoteId)
    if (app.globalData.insertNoteId) {
      // insert 后跳转
      let note = NotesTableObject.getWithoutData(app.globalData.insertNoteId)
      note.set({
        'tagId': e.currentTarget.dataset.id,
        'tagName': e.currentTarget.dataset.title,
      })

      note.update().then(res => {
        wx.showToast({
          title: '已加入文件夹',
          icon: 'success'
        })
        app.globalData.listRefreshFlag = true
        app.globalData.markListRefreshFlag = true
        app.globalData.insertNoteId = null
        wx.navigateTo({
          url: '../tagLists/tagLists?id=' + e.currentTarget.dataset.id + '&title=' + e.currentTarget.dataset.title
        })

      }, err => {
        wx.showToast({
          title: '网络异常',
          icon: 'none',
          duration: 2000
        })
      })
      
      // note.set('tagId', e.currentTarget.dataset.id)
      
      
    } else {
      wx.navigateTo({
        url: '../tagLists/tagLists?id=' + e.currentTarget.dataset.id + '&title=' + e.currentTarget.dataset.title
      })
    } 
    
  },

  //滑动
  itemTouchStart(e) {
    let { itemLeft, moveIdx } = this.data;
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

    } else if (Math.abs(disY) >= 6 && !this.canMove) {
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
    let half = deleteBtnWidth / 2
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
  preventScroll() {

  },

  deleteNote(e) {
    // let MyTableObject = new wx.BaaS.TableObject(getApp().globalData.tableID);
    let that = this;
    let tagId = e.currentTarget.dataset.id;
    let idx = e.currentTarget.dataset.index;
    let { tempDelObj, tempDelNum } = this.data;
    console.log(tagId)
    wx.showModal({
      title: '提示',
      content: '确认删除此文件夹？删除文件夹将会同时删除此文件夹中的便签！',
      cancelText: '取消',
      confirmText: '确定',
      success: function (res) {
        if (res.confirm) {
          let query = new wx.BaaS.Query()
          query.compare('tagId', '=', tagId)

          
          MyTableObject.delete(tagId).then(res => {
            // success

            NotesTableObject.delete(query).then(res => {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              app.globalData.listRefreshFlag = true
              app.globalData.markListRefreshFlag = true
            })



           
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

  reset() {
    this.setData({
      notesList: [],
      tempDelObj: {},
      pageNum: 0,
      tempDelNum: 0
    })
  },
  
  onPullDownRefresh() {
    this.reset()
    this.getAllListAsync()
  },
  onReachBottom() {
    let { pageNum, totalCount, numPerPage } = this.data;
    // 到达最后一页
    if (Math.floor(totalCount / numPerPage) < (pageNum + 1)) {
      return
    }
    this.setData({
      pageNum: this.data.pageNum + 1
    })
    this.getAllListAsync()
  }

})