/**
 * @desc 数据模块
 */

import {constMap} from './constant'
import {wxaUtils} from './utils'

const wxaData = {
  reportTimer: -1,
  userInfo: {},
  location: null,
  pageScrollTop: 0, // 页面滚动条数据
  trackData: [], // 统计数据
  errorData: [], // 错误数据
  performanceData: [], // 性能数据
  systemInfo: {}, // 系统信息
  hasSentSystemInfo: false, // 是否已经发送过系统信息
  isSendingSystemInfo: false, // 携带系统信息的请求是否在发送中
  addData (type, value) {
    switch (type) {
      case constMap.track:
        this.trackData = this.trackData.concat(value)
        break
      case constMap.error:
        this.errorData = this.errorData.concat(value)
        break
      case constMap.performance:
        this.errorData = this.errorData.concat(value)
        break
      default:
    }
  },
  setData (type, value) {
    switch (type) {
      case constMap.track:
        this.trackDat = value
        break
      case constMap.error:
        this.errorData = value
        break
      case constMap.performance:
        this.performanceData = value
        break
      default:
    }
  },
  clearData () {
    this.trackData = []
    this.errorData = []
    this.performanceData = []
  },
  getData (type) {
    let data
    switch (type) {
      case constMap.track:
        data = this.trackData
        break
      case constMap.error:
        data = this.errorData
        break
      case constMap.performance:
        data = this.performanceData
        break
      default:
    }
    return data
  },
  setStorage (key, value) {
    wx.setStorage({
      key,
      data: value,
      success: function() {
        wxaUtils.logInfo('设置统计数据缓存成功...')
      },
      fail: function() {
        wxaUtils.logInfo('设置统计数据缓存失败...')
      }
    })
  },
  recoverStorageItem (key, callback) {
    wx.getStorage({
      key,
      success (res) {
        wxaUtils.logInfo(`恢复缓存key:${key}`, res)
        if (res.data) {
          switch (key) {
            case constMap.track:
              wxaData.trackData = wxaData.trackData.concat(res.data)
              break
            case constMap.error:
              wxaData.errorData = wxaData.errorData.concat(res.data)
              break
            case constMap.performance:
              wxaData.performanceData = wxaData.performanceData.concat(res.data)
              break
            default:
          }
          // 清除单个缓存
          wxaData.removeStorageItem(key)
        }
      },
      complete () {
        wxaUtils.logInfo(`恢复缓存完成...${key}`)
        callback && callback()
      }
    })
  },
  removeStorageItem (key) {
    wx.removeStorage({
      key,
      success(res) {
        wxaUtils.logInfo(`remove ${key} cache success...`)
      }
    })
  }
}
export default wxaData
