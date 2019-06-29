// 这里需要缓存实际使用的框架支持的http 方法

export default {
  async post ({url, data = {}}) {
    try {
      const response = await wx.request({
        url,
        method: 'POST',
        data
      })
      return response.data
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}