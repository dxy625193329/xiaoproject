import Taro from '@tarojs/taro'
import { BASE_URL } from '../config'

export const getOpenId = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/wx/getOpenId`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const getUserByOpenId = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/user/getUserByOpenId`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const getBanner = () => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/event/activeList`,
      method: 'GET',
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const addUser = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/user/add`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const getOrderByOpenId = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/order/getOrderByOpenId`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const addFeedBack = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/feed/add`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const getOrderListForHunt = () => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/order/getOrderListForHunt`,
      method: 'GET',
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const addOrder = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/order/add`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const delOrder = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/order/del`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const updateOrder = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/order/update`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const updateUser = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/user/update`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const addHunter = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/hunter/add`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const getHunterReqByOpenId = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/hunter/getHunterReqByOpenId`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const getRankList = () => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/user/rankList`,
      method: 'GET',
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const addService = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/service/add`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const getServiceByOpenId = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/service/getServiceByOpenId`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const getPay = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/wx/getPay`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const refundPay = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/wx/refundPay`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}


export const getPhoneNumber = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/wx/getPhoneNumber`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}

export const cashOut = data => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}/wx/cashOut`,
      method: 'POST',
      data,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}