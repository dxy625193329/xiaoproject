import Taro from '@tarojs/taro'
import { BASE_URL } from '../config'

const get = url => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${url}`,
      method: 'GET',
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

const post = (url, data) => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${url}`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

// splashPage
export const getUserPhoneNumber = openId => {
  return post('/user/getUserPhoneNumber', { openId })
}

export const getOpenId = data => {
  return post('/wx/getOpenId', data)
}

export const addUser = data => {
  return post('/user/add', data)
}

// indexPage
export const getUserByOpenId = data => {
  return post('/user/getUserByOpenId', data)
}

export const getBanner = () => {
  return get('/event/activeList')
}

export const updateUser = data => {
  return post('/user/update', data)
}

export const getMessageList = data => {
  return post('/message/getMessageList', data)
}

// orderPage
export const getOrderListByOpenId = data => {
  return post('/order/getOrderListByOpenId', data)
}

// rankPage
export const getRankList = () => {
  return get('/user/rankList')
}

// mePage
export const getHunterReqByOpenId = data => {
  return post('/hunter/getHunterReqByOpenId', data)
}

export const getServiceByOpenId = data => {
  return post('/service/getServiceByOpenId', data)
}

// walletPage
export const getPay = data => {
  return post('/wx/getPay', data)
}

export const cashOut = data => {
  return post('/wx/getCashOut', data)
}

// beHunterPage
export const addHunter = data => {
  return post('/hunter/add', data)
}

export const addService = data => {
  return post('/service/add', data)
}

export const refundPay = data => {
  return post('/wx/refundPay', data)
}

// feedBackPage
export const addFeedBack = data => {
  return post('/feed/add', data)
}

// taskHallPage
export const getOrderListForHunt = () => {
  return get('/order/getOrderListForHunt')
}

// orderDetailPage
export const createOrder = data => {
  return post('/order/createOrder', data)
}

export const cancelOrder = data => {
  return post('/order/cancelOrderForRest', data)
}

export const cancelOrderForVoucher = data => {
  return post('/order/cancelOrderForVoucher', data)
}

export const hunterGetOrder = data => {
  return post('/order/hunterGetOrder', data)
}

export const hunterCompleteOrder = data => {
  return post('/order/hunterCompleteOrder', data)
}

export const userConfirmOrder = data => {
  return post('/order/userConfirmOrder', data)
}

export const delOrder = data => {
  return post('/order/del', data)
}

export const hunterCancelOrder = data => {
  return post('/order/hunterCancelOrder', data)
}

// messagePage

export const addAndUpdateMessage = data => {
  return post('/message/add', data)
}


