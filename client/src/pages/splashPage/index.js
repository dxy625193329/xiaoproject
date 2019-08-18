import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'

import { getNowDay } from '../../lib/time'
import { set } from '../../lib/global'
import { toast } from '../../lib/utils'

import { getOpenId, addUser, getUserPhoneNumber } from '../../api'

import './index.scss'

export default class SplashPage extends Component {

  componentDidMount() {
    this.saveUserPhoneNumber()
  }

  saveUserPhoneNumber = () => {
    const openid = Taro.getStorageSync('openid')
    if (openid) {
      set('openid', openid)
      getUserPhoneNumber(openid).then(res => {
        if (res.data.code === 200) {
          Taro.setStorageSync('phone', res.data.data.phoneNumber)
        }
        Taro.switchTab({
          url: '/pages/indexPage/index'
        })
      }).catch(err => toast('请检查您的网络环境后重试'))
    }
  }

  onGotUserInfo = res => {
    Taro.clearStorage()
    Taro.login().then(res => {
      const { code } = res
      getOpenId({ code }).then(res => {
        const { openid, session_key } = res.data
        Taro.getUserInfo({ lang: 'zh_CN' }).then(res => {
          const { userInfo } = res
          if (userInfo) {
            const user = {
              openId: openid,
              userName: userInfo.nickName,
              userAvatar: userInfo.avatarUrl,
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
                set('openid', openid)
                Taro.setStorageSync('session', session_key)
                Taro.setStorageSync('openid', openid)
                Taro.setStorageSync('serviceReaded', 0)
                Taro.setStorageSync('message', [])
                Taro.switchTab({
                  url: '/pages/indexPage/index'
                })
              } else if (res.data.code === 201) {
                const { phoneNumber } = res.data.data
                set('openid', openid)
                Taro.setStorageSync('session', session_key)
                Taro.setStorageSync('openid', openid)
                Taro.setStorageSync('serviceReaded', 0)
                Taro.setStorageSync('phone', phoneNumber)
                Taro.setStorageSync('message', [])
                Taro.switchTab({
                  url: '/pages/indexPage/index'
                })
              }
            }).catch(err => {
              toast('请检查您的网络状态后重试')
            })
          }
        }).catch(err => {
          toast('微信服务器无法获取用户信息')
        })
      }).catch(err => {
        toast('请检查您的网络状态后重试')
      })
    }).catch(err => {
      toast('请检查您的网络状态后重试')
    })
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
