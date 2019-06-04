
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return {
    fullDate: [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':'),
    yearOnly: [year, month, day].map(formatNumber).join('/'),
    hourOnly: [hour, minute].map(formatNumber).join(':')
  }
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function showBusy () {

  wx.showLoading({
    title: '加载中...',
  })

}

const getOpenid = (app) => {
  return new Promise((resolve, reject) => {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        //console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        console.log(res.result)
        if (app.userCallback) {
          app.userCallback(res.result.openid)
        }
        resolve(res)
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        reject(err)
      }
    })
  })

}

const ifGotOpenid = (app, callback) => {
  if (app.globalData.openid) {
    callback()
  } else {
    app.userCallback = () => {
      if (app.globalData.openid) {
        callback()
      }
    }


    // getOpenid(app).then(res => {
    //   console.log('获取openid失败，正在再次获取...')
    //   callback()
    // }).catch(res => {
    //   console.log(res)
    // });
  }
}

function getNoteTitle(con, idx){
  // let tr = con.match(/(.+)\n/g);
  let tr = con.split('\n')
  if (tr.length > 1 && tr[1] != '') {
    // console.log(tr)
    return tr[idx].replace(/(^\s*)|(\s*$)/g, "")
  } else {
    return tr[idx]
  }

}

function getList(MyTableObject){
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


      arr[index]['title'] = util.getNoteTitle(arr[index]['content'], 0)
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
}
module.exports = {
  formatTime: formatTime,
  showBusy,
  getOpenid,
  ifGotOpenid,
  getNoteTitle
}
