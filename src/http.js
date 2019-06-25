// 这里需要缓存实际使用的框架支持的http 方法
import wepy from 'wepy'

export default {
  async post ({url, data = {}}) {
    try {
      const response = await wepy.request({
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