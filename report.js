/**
 * @desc report模块
 */
import wxaConfig from './config'
import { wxaUtils } from './utils'
import wxaData from './data'

const report = {
  // 实时发送, 才支持指定url, 否则，很难处理。
  realTimeSend (data) {
    if (!wxaUtils.checkNetworkReady()) {
      return
    }
    const logData = wxaUtils.isArray(data) ? data : [data]
    let url = data.url ? data.url : `${wxaUtils.getRequestUrl(data[0].type)}`
    const sendData = report.composeSendData(logData)
    wxaUtils.send(url, sendData).then(function(res) {
      wxaUtils.logInfo('实时数据上报成功:')
       // 携带系统信息的请求发送成功后，设置标志位
      if (wxaData.isSendingSystemInfo) {
        wxaData.isSendingSystemInfo = false
        wxaData.hasSentSystemInfo = true
      }
    }).catch(function(e) {
      wxaUtils.logInfo('网络请求出现错误:', e)
      // wxaUtils.logData()
    })
  },
  // 发送存下来的数据
  sendData (callback) {
    if (!wxaUtils.checkNetworkReady()) {
      return
    }
    let dataType = report.getSendType()
    if (!dataType) {
      return
    }
    let url = `${wxaUtils.getRequestUrl(dataType)}`
    const originData = wxaData.getData(dataType)
    const logData = originData.splice(0, wxaConfig.maxReportNum)
    const sendData = report.composeSendData(logData)
    // 判断是否是实时上传
    // 根据数据上传的优先级，依次上传数据
    wxaUtils.send(url, sendData).then(function(res) {
      wxaUtils.logInfo('多条数据发送成功.')
      // 携带系统信息的请求发送成功后，设置标志位
      if (wxaData.isSendingSystemInfo) {
        wxaData.isSendingSystemInfo = false
        wxaData.hasSentSystemInfo = true
      }
      callback && callback('success')
    }).catch(function(e) {
      wxaUtils.logInfo('网络请求出现错误:', e)
      // 其它错误，数据放回原处。
      wxaData[`${dataType}Data`].unshift(...sendData.logs)
      callback && callback('fail')
      // wxaUtils.logData()
    })
  },
  // 根据数据发送的优先级，取出对应的缓存数据
  getSendType () {
    /* eslint-disable one-var */
    let key = '',
      hasDataKey = ''
    for (let i = 0, len = wxaConfig.priority.length; i < len; i++) {
      key = wxaConfig.priority[i]
      if (wxaData[`${key}Data`].length) {
        hasDataKey = key
        break
      }
    }
    return hasDataKey
  },
  composeSendData (logData) {
    const data = {
      project: wxaConfig.project,
      userInfo: wxaData.userInfo,
      logs: logData
    }
    return data
  }
}
export default report
