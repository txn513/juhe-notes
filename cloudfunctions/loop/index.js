const cloud = require('wx-server-sdk')
// 初始化 cloud
cloud.init();
const db = cloud.database();
const ttNotes = db.collection("ttNotes");
const _userInfo = db.collection("_userinfo");
exports.main = async(event, context) => {
  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  const res = await ttNotes.where({
    created_by: event.created_by
  }).get();

  // res.forEach((item, index)=>{
  //   let _data = item._openid = event.openid
  //   _userInfo.add({
  //     data: _data,
  //     success(res) {
  //       // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
  //       console.log(res)
  //     }
  //   })
  // })
  
  return {
    data: result
  }
}