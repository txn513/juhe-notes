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
module.exports = {
  formatTime: formatTime,
  showBusy,
  getOpenid,
  ifGotOpenid,
  getNoteTitle
}
