wxa: 微信小程序统计代码
==============================

<a href="https://developers.weixin.qq.com/miniprogram/dev/component/">
    <img src="https://img.shields.io/badge/-wx原生小程序-brightgreen.svg" alt="">
</a>
<a href="https://wepyjs.github.io/wepy-docs/index.html">
    <img src="https://img.shields.io/badge/-wepy1.0-green.svg" alt="">
</a>
<a href="https://wepyjs.github.io/wepy-docs/index.html">
    <img src="https://img.shields.io/badge/-wepy2.0-brightgreen.svg" alt="">
</a>

基本功能
----------------

一些常见统计场景

* 统计自定义事件(统计某个特定区域的点击事件)
* 错误上报（上报脚本错误，网络请求错误等）
* 性能数据上报(网络请求用时，小程序启动用时等)

总而言之，可用实现一套针对小程序自己的数据上报系统。



如何使用?
----------------
wepy 框架使用方法如下：
克隆此仓库到你的本地，将wxa项目文件夹拷贝到小程序的src目录下。
1. 配置wxa: wxa/src/config.js
```javascript
   // 注意： 数据统计和错误上报，性能上报这三个接口可以一样可以都不同。
const wxaConfig = {
    project: 'myMiniProgram', // 项目名称
    trackUrl: 'https://****/batch', // 数据统计接口URL
    errorUrl: 'https://****/batch',  // 错误上报接口URL
    performanceUrl: 'https://****/batch', // 性能上报接口URL
    version: '0.1', // 数据统计版本号
    prefix: '_wxa_', // 项目内部使用前缀
    priority: ['track', 'performance', 'error'], 
    // 发送请求的优先级，发送时，会按数组定义的顺序依次发送某个事件类型
    useStorage: true, // 是否开启storage缓存
    debug: false, // 是否开启调试（显示log）
    autoTrack: true, // 自动上报 onShow, onHide, 分享等 内置事件
    errorReport: false, // 是否开启错误上报
    performanceReport: false, // 接口性能上报
    maxReportNum: 20, // 当次上报最大条数
    intervalTime: 15,  // 定时上报的时间间隔，单位 s, 仅当开启了定时上报有效。
    networkList: ['wifi', '5g', '4g', '3g', // 允许上报的网络环境(枚举，表示在此数组里的网络环境就允许上报)
    opportunity: 'pageHide' 
    // pageHide、appHide、realTime(实时上报)、timing(定时上报) 上报的时机，四选一
}
```
2. app.wepy 中引入文件。
```javascript
   import wxa from './src/wxa/src/index.js'
   wxa.init() // 初始化wxa
```
3. 在获取用户登录后，设置用户信息。(也可以省略次步骤，这样统计的就是匿名信息。)
``` javascript
  // 比如，用户登录成功后，后台会返回userId,userName等用户唯一标识，后台据此来区分某个独立的用户。
  wxa.setUserInfo({userId: 10001, userName: '***'})
```
4. 开启上传
``` javascript
  wx.wxa.start()
```

5. 统计事件
``` javascript
   // 比如，我们想要统计某一个按钮的统计事件
   wx.wxa.track({
     event: 'CLICK', // 事件名称
     btnName: 'BUY',
     other: '****',
     .......
   })
   // 在内部，我们会组合成一条更具体的数据(包含了事件创建的时间戳，事件发生的页面path, 以及系统信息等。)，然后存入log数组中，等到上报时机到了，我们就会统一上报数据。

```

支持功能
----------------

* 支持配置是否自动拦截 特殊事件，如 appLaunch, appShow， onHide 等APP, Page 事件
* 支持配置是否使用wxStorage缓存统计数据。
* 支持配置数据上报的网络环境
* 支持配置上报的时机（实时，定时，页面onHide时等）

支持框架
----------------
* 微信原生小程序
* wepy1.x
* wepy2.0
* 更多框架支持中....

API
----------------
``` javascript
* wxa.init() // 初始化wxa
* wxa.setUserInfo(info) // 设置用户信息
* wxa.start() // 开启上报数据
* wxa.stop() // 停止上报数据
* wxa.track(data) // 统计事件
* wxa.errorReport(data) // 统计错误事件
* wxa.performanceReport(data) // 统计性能事件
```

数据统计方法签名：

```javascript
  /**
  * desc: track、errorReport、performanceReport函数签名
  * @param {Object} data - 要统计的数据对象
  * @param {string} data.event - 统计的事件名称 * 必填
  * @param {string} data.url - 此条数据发送的 url，可选, 未填写，则使用配置里对应事件指定的url
  * @param {string} data.isRealTime - 是否实时上报 ,可选
  * @param {*} data.other -统计的其它数据
  * @example
  *  数据统计:
  *  
  * 统计一条数据(非实时发送): 
  * wx.wxa.track({ event: 'CLICK', positionId: 'HOME_BUY_BUTTON', id: '545' })
  *        
  * 
  * 统计一条数据(非实时发送, 并且这条数据使用指定的url发送): wx.wxa.track({ event: 'CLICK', url: '****', positionId: 'HOME_BUY_BUTTON', id: '545', ...other })
  * 
  * 统计一条数据(实时发送): 
  * wx.wxa.track({ event: 'CLICK', isRealTime: true,  positionId: 'HOME_BUY_BUTTON', id: '545', ...other })
  * 
  * 统计一条数据(实时发送，并且这条数据使用指定的url发送): wx.wxa.track({ event: 'CLICK', isRealTime: true, url: '*****', positionId: 'HOME_BUY_BUTTON', id: '545', ...other })
  *  
  * 
  * 错误统计: 
  * wx.wxa.errorReport({event: 'pageError', positionId: 'HOME_BUY_BUTTON', id: '545', ...other })
  *  
  * 
  * 性能统计: 
  * wx.wxa.performanceReport({event: 'appLoad', ...other })
  *  这三个方法的函数签名一样，只是内部用于区分不同的统计事件。
  */
```
更详细文档待补充。
----------------


项目主页
----------------

https://github.com/itboos/wxa/