const cloud = require('wx-server-sdk')
// 初始化 cloud
cloud.init();
const db = cloud.database();
const userInfo = db.collection("userInfo");
exports.main = async(event, context) => {
  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  const wxContext = await cloud.getWXContext();
  const openid = wxContext.OPENID;
  const appid = wxContext.APPID;
  const unionid = wxContext.UNIONID;
  
  return {
    openid,
    appid,
    unionid
  }
}