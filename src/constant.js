/**
 * @desc 常量定义
 */
import wxaConfig from './config'
// 特殊事件MAP
export const eventMap = {
  appLaunch: 'appLaunch',
  pageView: 'pageView', //  页面停留时间
  appView: 'appView', //  页面停留时间
  pageScroll: 'pageScroll', // 页面滚动事件
  pullDownRefresh: 'pullDownRefresh',
  wxRequest: 'wxRequest', // 微信请求事件
  wxShare: 'wxShare', // 微信分享
  onWarn: 'onWarn', // console.warn
  onError: 'onError', // error 相关
  downloadFile: 'downloadFile',
  reachBottom: 'reachBottom',
  appSystemInfo: 'appSystemInfo' // 系统信息上报
}
// 常量MAP
export const constMap = {
  track: 'track',
  error: 'error',
  performance: 'performance',
  trackKey: `${wxaConfig.prefix}|track|data`,
  errorKey: `${wxaConfig.prefix}|error|data`,
  performanceKey: `${wxaConfig.prefix}|performance|data`
}
