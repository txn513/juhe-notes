let util = require('../../utils/util.js')
const app = getApp()

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

    //更新参数
    // needRefresh: false,
    
  },
  onLoad(){
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

    this.getAllNotesAsync()
    // this.loop();
  },
  onShow(){
    // 
    console.log(app.globalData.listRefreshFlag)
    if (!app.globalData.listRefreshFlag) {
      return;
    }
    this.getAllNotesAsync()
  },

  getAllNotesAsync(){
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
  // 获取便签列表
  getAllNotes(){
    util.showBusy()
    let that = this;
    let tableID = 41764;
    let MyTableObject = new wx.BaaS.TableObject(tableID)
    let query = new wx.BaaS.Query()
    let id = getApp().globalData.userID
    query.compare('created_by', '=', id)

    MyTableObject.setQuery(query).orderBy('-created_at').find().then(res => {
      // success
      console.log(res)

      let list = res.data.objects;
      list.forEach((value, index, arr) => {
        arr[index]['created_at'] = new Date(arr[index]['created_at']*1000).toLocaleString()
        arr[index]['title'] = this.getNoteTitle(arr[index]['content'],0)
        arr[index]['subTitle'] = this.getNoteTitle(arr[index]['content'], 1)
      });
      // console.log(list)
      // this.getNoteTitle(list[0].content)
      this.setData({
        notesList: list,
        listLen: list.length,
        // needRefresh: false
        // loaded: true
      });
      app.globalData.listRefreshFlag = true
      wx.hideLoading()
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, err => {
      wx.hideLoading()
      // err
    })
  },
  getNoteTitle(con, idx){
    // let tr = con.match(/(.+)\n/g);
    let tr = con.split('\n')
    if (tr.length > 1 && tr[1] != '') {
      // console.log(tr)
      return tr[idx].replace(/(^\s*)|(\s*$)/g, "")
    } else {
      return tr[idx]
    }
    
  },
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
      console.log(111111)
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
    
    // if (Math.abs(dis) <= this.data.deleteBtnWidth && dis > 0) {
    //   if (Math.abs(disY) < 2) {
    //     this.setData({
    //       addAnimation: false,
    //       preventScroll: true,
    //       itemLeft: dis,
    //     })
    //   }
      
    // } else {
      
    //   this.setData({
    //     preventScroll: false,
    //     addAnimation: true
    //   })
    // }
   
    
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
    let MyTableObject = new wx.BaaS.TableObject(getApp().globalData.tableID);
    let that = this;
    let noteID = e.currentTarget.dataset.id
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
            that.getAllNotes()
            that.setData({
              itemLeft: 0,
            })
          }, err => {
            // err
          })
        } else if (res.cancel) {

        }
      }
    })

  },
  onPullDownRefresh(){
    this.getAllNotesAsync()
  },

  
})