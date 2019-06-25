/* eslint-disable one-var */
/**
 * @desc 特殊事件、错误，微信请求等事件拦截处理
 */
import wxaConfig from './config'
import { wxaUtils } from './utils'
import wxaData from './data'
import { eventMap, constMap } from './constant'
import report from './report'
import WXA from './wxa'

// 特殊事件拦截
function interceptWxfunc() {
  let beginTime = 0,
    currRoute = '',
    appBeginTime = 0
  function e(t, n, o) {
    if (t[n]) {
      let e = t[n]
      t[n] = function (t) {
        // 原始方法调用
        e.call(this, t)
        // 用户添加方法调用
        o.call(this, t, n)
      }
    } else {
      t[n] = function (t) {
        o.call(this, t, n)
      }
    }
  }
  function appShow(pram) {
    wxaUtils.logInfo('拦截的appOnShow.....')
    appBeginTime = wxaUtils.getTime()
  }
  function appHide(pram) {
    let stayTime = wxaUtils.getTime() - appBeginTime
    wxaUtils.logInfo('appOnHide.....', stayTime)
    WXA.track({ event: eventMap.appView, stayTime })
     // 是否在appHide里发送数据
    if (wxaConfig.opportunity === 'appHide' && WXA.sendFlag) {
      report.sendData((msg) => {
        if (msg === 'success' && wxaConfig.useStorage) {
          wxaData.trackData.length && wxaData.setStorage(constMap.trackKey, wxaData.trackData)
          wxaData.errorData.length && wxaData.setStorage(constMap.errorKey, wxaData.errorData)
          wxaData.performanceData.length && wxaData.setStorage(constMap.performancKey, wxaData.performanceData)
        }
      })
    }
  }
  function appLaunch(para) {
    // 统计启动时的场景值
    const scene = para.scene || -1
    wxaUtils.logInfo('appLaunch...场景值', scene)
    WXA.track({ event: eventMap.appLaunch, scene, route: currRoute, para: para })
    // 恢复缓存
    wxaData.recoverStorageItem(constMap.trackKey)
    wxaData.recoverStorageItem(constMap.errorKey)
    wxaData.recoverStorageItem(constMap.performanceKey)
  }
  function appError(e) {
    const currRoute = wxaUtils.getPagePath()
    const data = { type: 'errorReport', event: eventMap.onError, route: currRoute, errrMsg: e }
    wxaUtils.logInfo('拦截的onError', data)
  }
  function onLoad(para) {
    wxaUtils.logInfo('pageOnLoad', para)
  }
  function onUnload() {
    wxaUtils.logInfo('pageUnload....')
    onHide()
  }
  function onShow(para, n) {
    wxaUtils.logInfo('拦截的onShow.....')
    wxaUtils.logData()
    beginTime = wxaUtils.getTime()
  }
  function onHide(para) {
    if (wxaConfig.autoTrack) {
      currRoute = wxaUtils.getPagePath()
      let stayTime = wxaUtils.getTime() - beginTime
      WXA.track({ event: eventMap.pageView, stayTime, scrollTop: wxaData.scrollTop, route: currRoute })
      wxaData.scrollTop = 0
      wxaUtils.logInfo('拦截的onHide....stayTime', stayTime, wx.wxa)
    }
    // 是否在onHide里发送数据
    if (wxaConfig.opportunity === 'pageHide' && WXA.sendFlag) {
      report.sendData()
    }
  }
  function onPullDownRefresh(para) {
    currRoute = wxaUtils.getPagePath()
    wxaUtils.logInfo('用户下拉刷新...', arguments, currRoute)
    WXA.track({ event: eventMap.pullDownRefresh, route: currRoute })
  }
  function onReachBottom() {
    currRoute = wxaUtils.getPagePath()
    wxaUtils.logInfo('下拉接触到底部...', arguments, currRoute)
    WXA.track({ event: eventMap.reachBottom, route: currRoute })
  }
  function onShareAppMessage(para) {
    wxaUtils.logInfo('用户分享...', arguments)
    currRoute = wxaUtils.getPagePath()
    WXA.track({ event: eventMap.wxShare, route: currRoute })
  }
  function onPageScroll(e) {
    wxaUtils.logInfo('页面滚动:', e, e.scrollTop)
    // 只记录页面滚动历史中的最大值
    if (e.scrollTop > wxaData.pageScrollTop) {
      wxaData.pageScrollTop = e.scrollTop
    }
  }
  /* global App */
  const oldApp = App
  // eslint-disable-next-line
  App = function (t) {
    wxaUtils.logInfo('APP:', t)
    wxaConfig.autoTrack && e(t, 'onLaunch', appLaunch)
    wxaConfig.autoTrack && e(t, 'onShow', appShow)
    wxaConfig.autoTrack && e(t, 'onHide', appHide)
    wxaConfig.errorReport && e(t, 'onError', appError)
    oldApp(t)
  }
  /* global Page */
  const oldPage = Page
  // eslint-disable-next-line
  Page = function(option) {
    wxaConfig.autoTrack && e(option, 'onLoad', onLoad)
    wxaConfig.autoTrack && e(option, 'onShow', onShow)
    if (wxaConfig.autoTrack || wxaConfig.opportunity === 'pageHide') {
      e(option, 'onHide', onHide)
    }
    wxaConfig.autoTrack && e(option, 'onUnload', onUnload)
    wxaConfig.autoTrack && option.onPullDownRefresh && e(option, 'onPullDownRefresh', onPullDownRefresh)
    wxaConfig.autoTrack && option.onReachBottom && e(option, 'onReachBottom', onReachBottom)
    wxaConfig.autoTrack && option.onShareAppMessage && e(option, 'onShareAppMessage', onShareAppMessage)
    // 页面滚动
    // wxaConfig.autoTrack && option.onPageScroll && e(option, 'onPageScroll', onPageScroll)
    oldPage.apply(null, [].slice.call(arguments))
  }
}
// 错误和接口性能上报初始化
function otherReportInit() {
  // 错误上报 拦截console.warn, console.error
  if (console && wxaConfig.errorReport) {
    const oldWarn = console.warn,
      oldError = console.error
    console.warn = function() {
      const e = [].slice.call(arguments)
      if (!e.length) { return true }
      const currRoute = wxaUtils.getPagePath()
      WXA.errorReport({event: eventMap.onWarn, route: currRoute, errrMsg: arguments[0]})
      wxaUtils.logInfo('捕捉到warn 事件,', e)
      oldWarn.apply(console, e)
    }
    console.error = function() {
      var e = [].slice.call(arguments)
      if (!e.length) { return true }
      const currRoute = wxaUtils.getPagePath()
      WXA.errorReport({event: eventMap.onError, route: currRoute, errrMsg: arguments[0]})
      wxaUtils.logInfo('捕捉到error 事件,', e)
      oldError.apply(console, e)
    }
  }
  // 性能上报
  if (wxaConfig.performanceReport) {
    let Request = {
      request: function (e) {
        let success = e[0].success,
          fail = e[0].fail,
          beginTime = wxaUtils.getTime(),
          endTime = 0
        e[0].success = function () {
          endTime = wxaUtils.getTime()
          const performance = {
            type: constMap.performance,
            event: eventMap.wxRequest,
            url: e[0].url,
            status: arguments[0].statusCode,
            begin: beginTime,
            end: endTime,
            total: endTime - beginTime
          }
          wxaUtils.logInfo('success performance:', performance)
          WXA.performanceReport(performance)
          success && success.apply(this, [].slice.call(arguments))
        }
        e[0].fail = function () {
          endTime = wxaUtils.getTime()
          const performance = {
            type: constMap.performance,
            event: eventMap.wxRequest,
            url: e[0].url,
            status: arguments[0].statusCode,
            begin: beginTime,
            end: endTime,
            total: endTime - beginTime
          }
          wxaUtils.logInfo('fail performance:', performance)
          WXA.performanceReport(performance)
          fail && fail.apply(this, [].slice.call(arguments))
        }
      },
      downloadFile: function (e) {
        // wx.downloadFile
        let success = e[0].success,
          fail = e[0].fail,
          beginTime = wxaUtils.getTime(),
          endTime = 0
        e[0].success = function (e) {
          endTime = wxaUtils.getTime()
          const reportData = {
            type: constMap.performance,
            event: eventMap.downloadFile,
            url: e[0].url,
            total: endTime - beginTime
          }
          WXA.performanceReport(reportData)
          wxaUtils.logInfo('下载成功：', e, reportData)
          success && success.apply(this, [].slice.call(arguments))
        }
        e[0].fail = function (e) {
          const reportData = {
            type: constMap.performance,
            event: eventMap.downloadFile,
            url: e[0].url,
            desc: 'fail'
          }
          WXA.performanceReport(reportData)
          wxaUtils.logInfo('下载失败：', e, reportData)
          fail && fail.apply(this, [].slice.call(arguments))
        }
      }
    }

    // 替换微信相关属性
    let oldWx = wx,
      newWx = {}
    for (var p in wx) {
      if (Request[p]) {
        let p2 = p.toString()
        newWx[p2] = function () {
          Request[p2](arguments)
          oldWx[p2].apply(oldWx, [].slice.call(arguments))
        }
      } else {
        newWx[p] = oldWx[p]
      }
    }
    // eslint-disable-next-line
    wx = newWx
    // 内存警告
    if (wx.onMemoryWarning) {
      wx.onMemoryWarning(function(res) {
        const { level = -1 } = res
        wxaUtils.logInfo('收到内存警告。。。。', level)
        // 清空缓存
        wxaData.removeStorage()
        // 清空统计数据
        wxaData.clearData()
      })
    }
  }
}

export {
  interceptWxfunc,
  otherReportInit
}
