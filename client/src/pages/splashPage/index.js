import Taro, { Component } from '@tarojs/taro'
import {
  View,
  Text,
  Button
} from '@tarojs/components'

import {
  getNowDay
} from '../../lib/time'
import { set } from '../../lib/global'
import { toast } from '../../lib/utils'

import {
  getOpenId,
  getUserByOpenId,
  addUser,
} from '../../api'

import './index.scss'

export default class SplashPage extends Component {

  componentWillMount() {
    const openid = Taro.getStorageSync('openid')
    if (openid) {
      this.checkUserExist(openid)
    }
  }

  checkUserExist = openid => {
    getUserByOpenId({ openId: openid }).then(res => {
      if (res.data.code === 200) {
        set('openid', openid)
        Taro.switchTab({
          url: '/pages/indexPage/index'
        })
      }
    })
  }

  onGotUserInfo = res => {
    Taro.cloud.callFunction({
      name: 'login',
      data: {}
    }).then(res => {
      if (res.result.openid) {
        const { openid } = res.result
        Taro.getUserInfo({ lang: 'zh_CN' }).then(res => {
          const { userInfo } = res
          if (
            userInfo.nickName &&
            userInfo.avatarUrl &&
            userInfo.gender &&
            userInfo.city
          ) {
            const user = {
              openId: openid,
              userName: userInfo.nickName,
              userAvatar: userInfo.avatarUrl,
              userGender: userInfo.gender,
              userCity: userInfo.city,
              dayQuest: [{
                date: getNowDay(),
                order: [],
                quest1: false,
                quest2: false,
                quest3: false
              }]
            }
            addUser({ user }).then(res => {
              if (res.data.code === 200) {
                Taro.switchTab({
                  url: '/pages/indexPage/index'
                })
                set('openid', openid)
                Taro.setStorageSync('openid', openid)
                Taro.setStorageSync('serviceReaded', 0)
              } else if (res.data.code === 201) {
                const { phoneNumber } = res.data.data
                set('user', res.data.data)
                set('openid', openid)
                Taro.setStorageSync('openid', openid)
                Taro.setStorageSync('serviceReaded', 0)
                Taro.setStorageSync('phone', phoneNumber)
                Taro.switchTab({
                  url: '/pages/indexPage/index'
                })
              } else {
                toast('请检查您的网络状态后重试', 'none')
              }
            }).catch(err => {
              toast('请检查您的网络状态后重试', 'none')
            })
          } else {
            toast('请检查您的网络状态后重试', 'none')
          }
        })
      }
    })
    // Taro.login().then(res => {
    //   const { code } = res
    //   getOpenId({ code }).then(res => {
    //     const { openid, session_key } = res.data
    //     Taro.setStorageSync('openid', openid)
    //     Taro.setStorageSync('auth', true)
    //     Taro.setStorageSync('serviceReaded', 0)
    //     set('openid', openid)
    //     Taro.getUserInfo({ lang: 'zh_CN' }).then(res => {
    //       const { userInfo } = res
    //       if (
    //         userInfo.nickName &&
    //         userInfo.avatarUrl &&
    //         userInfo.gender &&
    //         userInfo.city
    //       ) {
    //         const user = {
    //           openId: openid,
    //           userName: userInfo.nickName,
    //           userAvatar: userInfo.avatarUrl,
    //           userGender: userInfo.gender,
    //           userCity: userInfo.city,
    //           dayQuest: [{
    //             date: getNowDay(),
    //             order: [],
    //             quest1: false,
    //             quest2: false,
    //             quest3: false
    //           }]
    //         }
    //         addUser({ user }).then(res => {
    //           if (res.data.code === 200) {
    //             Taro.switchTab({
    //               url: '/pages/indexPage/index'
    //             })
    //           } else if (res.data.code === 201) {
    //             const { phoneNumber } = res.data.data
    //             set('user', res.data.data)
    //             Taro.setStorageSync('phone', phoneNumber)
    //             Taro.switchTab({
    //               url: '/pages/indexPage/index'
    //             })
    //           } else {
    //             toast('请检查您的网络状态', 'none')
    //           }
    //         }).catch(err => {
    //           toast('请检查您的网络状态', 'none')
    //         })
    //       } else {
    //         toast('请检查您的网络状态', 'none')
    //       }
    //     })
    //   }).catch(err => toast('请检查您的网络状态', 'none'))
    // }).catch(err => toast('请检查您的网络状态', 'none'))
  }

  routeToAgreePage = () => {
    Taro.navigateTo({
      url: '/pages/agreePage/index'
    })
  }

  render() {
    return (
      <View className='splash'>
        <View className='auth'>
          <View className='logo'>
            <View
              className='logo--img'
              src='http://cdn.xwuyou.com/logo.png'
            ></View>
          </View>
          <View className='info'>
            <View className='info--title'>为了更好的服务，请确认授权以下信息</View>
            <View className='info--text'>· 获得您的公开信息（昵称、头像、地区及性别）</View>
            <View className='info--text'>· 获得您的手机号码</View>
            <View className='info--text'>授权即同意<Text className='agreement' onClick={this.routeToAgreePage}>《校无忧用户协议》</Text></View>
            <Button
              className='auth--btn'
              openType="getUserInfo"
              lang="zh_CN"
              onGetUserInfo={this.onGotUserInfo}
            >授权登陆</Button>
          </View>
        </View>
      </View>
    )
  }
}
