import Taro, { Component } from '@tarojs/taro'
import {
  View,
  Image,
  Button
} from '@tarojs/components'

import { set, get } from '../../lib/global'
import {
  getUserByOpenId,
  getHunterReqByOpenId,
  getServiceByOpenId,
  updateUser,
  getOpenId,
  getPhoneNumber
} from '../../api'
import { toast } from '../../lib/utils'
import WXBizDataCrypt from '../../lib/auth'

import './index.scss'

export default class MePage extends Component {

  config = {
    navigationBarTitleText: '我的'
  }

  state = {
    wxName: '',
    wxAvatar: '',
    userOrderCount: 0,
    hunterOrderCount: 0,
    isHunter: false,
    hunterLevel: {},
    userLevel: {},
    hasPostHunterReq: false,
    serviceListLength: 0,
    serviceReaded: 0,
    phoneNumber: '',
  }

  componentDidShow() {
    this.fetchUserData()
  }

  fetchUserData = () => {
    const openId = get('openid')
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
      this.getService(openId)
    })
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
    let expViewList = new Array(10).fill(0)
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
    if (path === 'beHunterPage/index' && this.state.hasPostHunterReq) {
      Taro.showToast({
        title: '你已提交审核，请耐心等待',
        icon: 'none',
        duration: 2000
      })
    } else {
      Taro.navigateTo({
        url: `/pages/${path}`
      })
    }
  }

  onGotPhoneNumber = res => {
    // 对没有绑定手机号的情况做手动输入的兼容处理
    const response = res
    Taro.checkSession({
      success: () => {
        const session_key = get('session')
        this.getPhoneNumber(session_key, response)
      }, fail: () => {
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
      toast('微信服务器异常，请重试或稍后再试', 'none')
    })
  }

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
      phoneNumber
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
        <View className='top'>
          <View className='left'>
            <View className='name'>{wxName}</View>
            {
              phoneNumber ? <View className='phone'>{phoneNumber}</View> :
                <Button
                  className='auth-phone'
                  openType="getPhoneNumber"
                  onGetPhoneNumber={this.onGotPhoneNumber}
                >授权电话号码</Button>
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
            <View className='level'>{isHunter ? hunterLevel.name : userLevel.name}</View>
            <View className='exp'>
              <View className='num'>{isHunter ? this.calcExp(hunterLevel.exp, hunterLevel.levelUp) : this.calcExp(userLevel.exp, userLevel.levelUp)}</View>
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
