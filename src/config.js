/**
 * @desc 数据统计配置
 */
const wxaConfig = {
  project: 'myMiniProgram', // 项目名称
  trackUrl: 'https://youhost.com/batch', // 后台数据统计接口
  errorUrl: 'https://youhost.com/batch',  // 后台错误上报接口
  performanceUrl: 'https://youhost.com/batch', // 后台性能上报接口
  version: '0.1',
  prefix: '_wxa_',
  priority: ['track', 'performance', 'error'], // 发送请求的优先级，发送时，会依次发送
  useStorage: true, // 是否开启storage缓存
  debug: false, // 是否开启调试（显示log）
  autoTrack: true, // 自动上报 onShow, onHide, 分享等 内置事件
  errorReport: false, // 是否开启错误上报
  performanceReport: false, // 接口性能上报
  maxReportNum: 20, // 当次上报最大条数
  intervalTime: 15,  // 定时上报的时间间隔，单位 s, 仅当开启了定时上报有效。
  networkList: ['wifi', '4g', '3g'], // 允许上报的网络环境
  opportunity: 'pageHide' // pageHide、appHide、realTime(实时上报)、timing(定时上报) 上报的时机，四选一
}
export default wxaConfig
