import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button } from '@tarojs/components'

import { set, get } from '../../lib/global'
import { getUserByOpenId, getHunterReqByOpenId, getServiceByOpenId, updateUser, getOpenId } from '../../api'
import { toast } from '../../lib/utils'
import WXBizDataCrypt from '../../lib/auth'

import './index.scss'

export default class MePage extends Component {

  config = {
    navigationBarTitleText: '我的'
  }

  state = {
    wxName: '',
    loginText: '点击此处登录',
    wxAvatar: 'http://cdn.xwuyou.com/logo.png',
    userOrderCount: 0,
    hunterOrderCount: 0,
    isHunter: false,
    hunterLevel: {},
    userLevel: {},
    hasPostHunterReq: false,
    serviceListLength: 0,
    serviceReaded: 0,
    phoneNumber: '',
    showPhoneMask: false,
    value: '',
    showPhoneAuth: false
  }

  componentDidShow() {
    this.fetchUserData()
  }

  fetchUserData = () => {
    const openId = Taro.getStorageSync('openid')
    if (openId) {
      getUserByOpenId({ openId }).then(res => {
        const { user } = res.data.data
        set('user', user)
        this.setState({
          isHunter: user.isHunter,
          userOrderCount: user.userOrderCount,
          hunterOrderCount: user.hunterOrderCount,
          hunterLevel: user.hunterLevel,
          userLevel: user.userLevel,
          phoneNumber: user.phoneNumber,
          wxName: user.userName,
          wxAvatar: user.userAvatar,
        })
      })
      this.getService(openId)
    }
  }

  getService = openId => {
    const tempCont = Taro.getStorageSync('serviceReaded')
    getServiceByOpenId({ openId }).then(res => {
      this.setState({ serviceListLength: res.data.data.serviceList.length - tempCont })
      getHunterReqByOpenId({ openId }).then(res => {
        if (res.data.message !== '') {
          this.setState({ hasPostHunterReq: true })
        } else {
          this.setState({ hasPostHunterReq: false })
        }
      })
    })
  }

  calcExp = (exp, levelUp) => (exp / levelUp).toFixed(2) * 100

  showExpView = () => {
    const { userLevel, hunterLevel, isHunter } = this.state
    const expViewList = new Array(10).fill(0)
    let length
    if (isHunter) {
      length = parseInt((hunterLevel.exp / hunterLevel.levelUp) * 10)
    } else {
      length = parseInt((userLevel.exp / userLevel.levelUp) * 10)
    }
    expViewList.fill(1, 0, length)
    return expViewList
  }

  handleRouteItemPage = path => {
    if (Taro.getStorageSync('openid')) {
      if (path === 'beHunterPage/index' && this.state.hasPostHunterReq) {
        toast('你已提交审核，请耐心等待')
      } else {
        Taro.navigateTo({
          url: `/pages/${path}`
        })
      }
    } else {
      toast('您还没有登录，无法获得您的用户信息')
    }
  }

  onGotPhoneNumber = res => {
    // 对没有绑定手机号的账号做兼容处理
    const response = res
    if (res.detail.errMsg === 'getPhoneNumber:fail user deny') {
      this.setState({ showPhoneMask: false })
      toast('授权后才能愉快的玩耍哦！')
    } else {
      Taro.checkSession({
        success: () => {
          const session_key = Taro.getStorageSync('session')
          if (session_key) {
            this.getPhoneNumber(session_key, response)
          } else {
            this.setState({ showPhoneMask: true })
          }
        },
        fail: () => {
          Taro.login().then(res => {
            const { code } = res
            getOpenId({ code }).then(res => {
              const { session_key } = res.data
              this.getPhoneNumber(session_key, response)
            })
          })
        }
      })
    }
  }

  getPhoneNumber = (session, response) => {
    const user = get('user')
    const pc = new WXBizDataCrypt('wx8c162ea3a4ffdeb1', session)
    pc.decryptData(response.detail.encryptedData, response.detail.iv).then(res => {
      const { phoneNumber } = res
      Taro.setStorageSync('phone', phoneNumber)
      user.phoneNumber = phoneNumber
      this.setState({ phoneNumber })
      set('user', user)
      updateUser({ user })
    }).catch(err => {
      this.setState({ showPhoneMask: true })
    })
  }

  hideMask = () => {
    this.setState({ showPhoneMask: false })
  }

  handleInputChange = e => {
    this.setState({ value: e.target.value })
  }

  handleBind = () => {
    const user = get('user')
    const phoneNumber = this.state.value
    Taro.setStorageSync('phone', phoneNumber)
    user.phoneNumber = phoneNumber
    this.setState({ phoneNumber, showPhoneMask: false })
    set('user', user)
    updateUser({ user }).then(res => {
      if (res.data.code === 200) {
        toast('手机号码绑定成功', 'none')
      }
    })
  }

  handleAuth = () => {
    Taro.navigateTo({
      url: '/pages/splashPage/index'
    })
  }

  preventTouchMove = () => { }

  render() {
    const {
      hunterLevel,
      userLevel,
      hunterOrderCount,
      userOrderCount,
      isHunter,
      wxName,
      wxAvatar,
      serviceListLength,
      phoneNumber,
      loginText
    } = this.state

    const entryList = [
      { name: '钱包', icon: require('../../assets/image/ic_wallet.png'), path: 'walletPage/index' },
      { name: '猎人', icon: require('../../assets/image/ic_hunter.png'), path: 'beHunterPage/index' },
      { name: '任务', icon: require('../../assets/image/ic_mission.png'), path: 'questPage/index' },
      { name: '意见或建议', icon: require('../../assets/image/ic_feedback.png'), path: 'feedBackPage/index' },
      { name: '客服', icon: require('../../assets/image/ic_service.png'), path: 'servicePage/index' },
    ]

    return (
      <View className='me'>
        {
          showPhoneMask ? <View catchtouchmove={this.preventTouchMove}>
            <View className='mask' onClick={() => this.hideMask()}></View>
            <View className='mask--wrapper'>
              <View className='mask--content'>
                <View className='title'>您的微信可能没有绑定手机号码</View>
                <Input
                  className='input'
                  cursor-spacing='100px'
                  value={value}
                  placeholder='输入您的手机号码'
                  type='digit'
                  maxLength='11'
                  onInput={this.handleInputChange}
                />
                <View className='check' onClick={this.handleBind}>绑定</View>
              </View>
            </View>
          </View> : null
        }
        <View className='top'>
          <View className='left'>
            {
              Taro.getStorageSync('openid') ? <View className='name'>{wxName}</View> : <View className='name' onClick={this.handleAuth}>{loginText}</View>
            }
            {
              phoneNumber ? <View className='phone'>{phoneNumber}</View> : (
                Taro.getStorageSync('openid') ?
                  <Button
                    className='auth-phone'
                    openType="getPhoneNumber"
                    onGetPhoneNumber={this.onGotPhoneNumber}
                  >授权电话号码</Button> : null)
            }
          </View>
          <Image className='right' src={wxAvatar} />
        </View>
        <View className='middle'>
          <View className='card'>
            {
              isHunter ? <Image src='http://cdn.xwuyou.com/hunter_1.png' className='title' /> :
                <Image src='http://cdn.xwuyou.com/user_1.png' className='title' />
            }
            <View className='level'>{Taro.getStorageSync('openid') ? (isHunter ? hunterLevel.name : userLevel.name) : '未登录用户'}</View>
            <View className='exp'>
              <View className='num'>{Taro.getStorageSync('openid') ? (isHunter ? this.calcExp(hunterLevel.exp, hunterLevel.levelUp) : this.calcExp(userLevel.exp, userLevel.levelUp)) : 0}</View>
              <View className='singal'>%</View>
            </View>
            <View className='dots'>
              {
                this.showExpView().map((item, index) => {
                  return item === 1 ?
                    <View className='exp-dot full' key={index}></View> :
                    <View className='exp-dot empty' key={index}></View>
                })
              }
            </View>
            <View className='number'>{isHunter ? `已完成${hunterOrderCount}次猎人任务` : `已发布${userOrderCount}次需求任务`}</View>
          </View>
        </View>
        <View className='bottom'>
          {
            entryList.map((item, index) =>
              <View
                className='item'
                key={index}
                onClick={() => this.handleRouteItemPage(item.path)}
              >
                <Image src={item.icon} className='icon' />
                <View className='text'>{item.name}</View>
                <View className='right'>
                  {
                    item.name === '客服' && serviceListLength > 0 && <View className='no-read'>{serviceListLength}</View>
                  }
                  <Image
                    src={require('../../assets/image/ic_arrow.png')}
                    className='arrow'
                  ></Image>
                </View>
              </View>
            )
          }
        </View>
      </View>
    )
  }
}
