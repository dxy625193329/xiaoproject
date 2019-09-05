import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

import { getTime, getDay, getNowDay } from '../../lib/time'
import { set, get } from '../../lib/global'
import { toast } from '../../lib/utils'

import { getUserByOpenId, getBanner, updateUser, getMessageList } from '../../api'

import Banner from '../../components/Banner'
import './index.scss'

const services = [
  {
    name: '发布需求',
    desc: '所有用户都可以快速发布需求',
    cover: 'http://cdn.xwuyou.com/service_1.jpg'
  },
  {
    name: '任务大厅',
    desc: '当前板块只限猎人接取任务',
    cover: 'http://cdn.xwuyou.com/service_2.jpg'
  }
]

export default class IndexPage extends Component {

  state = {
    banners: [],
    phoneNumber: '',
    showEvent: false,
    timer: null,
    messageLength: 0
  }

  componentDidMount() {
    const showEvent = Taro.getStorageSync('showEvent')
    if (showEvent) {
      Taro.hideTabBar()
    }
    this.setState({ showEvent })
    getBanner().then(res => this.setState({
      banners: res.data.data.eventList
    })).catch(err => {
      toast('请检查您的网络状态', 'none')
    })
    setInterval(this.fetchIm, 15000)
  }

  componentDidShow() {
    this.fetchData()
    this.fetchIm()
  }

  componentDidHide() {
    clearInterval(this.state.timer)
  }

  fetchIm = () => {
    getMessageList({ openId: get('openid') }).then(res => {
      if (res.data.code === 200) {
        const { messageList } = res.data
        let length = 0
        for (let i = 0; i < messageList.length; i++) {
          length += messageList[i].message.length
        }
        this.setState({ messageLength: length })
      }
    })
  }

  routeToChildPage = id => {
    const phoneNumber = Taro.getStorageSync('phone')
    if (phoneNumber) {
      if (id === 0) {
        Taro.navigateTo({
          url: '/pages/orderTypePage/index'
        })
      } else {
        Taro.navigateTo({
          url: '/pages/taskHallPage/index'
        })
      }
    } else {
      Taro.showModal({
        title: '提示',
        content: '发单或者接单都需要授权手机号码',
        confirmText: '前往授权',
      }).then(res => {
        if (res.confirm) {
          Taro.switchTab({
            url: '/pages/mePage/index'
          })
        }
      })
    }
  }

  routeToImList = () => {
    Taro.navigateTo({
      url: '/pages/imListPage/index'
    })
  }

  fetchData = () => {
    const openId = get('openid')
    getUserByOpenId({ openId }).then(res => {
      const { user } = res.data.data
      const { isHunter, dayQuest } = res.data.data.user
      set('user', user)
      set('isHunter', isHunter)
      if (dayQuest[dayQuest.length - 1].date !== getNowDay()) {
        dayQuest.push({
          date: getNowDay(),
          order: [],
          quest1: false,
          quest2: false,
          quest3: false
        })
        user.dayQuest = dayQuest
        updateUser({ user })
      }
    }).catch(err => {
      toast('请检查您的网络状态', 'none')
    })
  }

  handleEventOk = () => {
    this.setState({ showEvent: false })
    Taro.setStorageSync('showEvent', false)
    Taro.showTabBar()
  }

  render() {
    const { showEvent, messageLength } = this.state
    return (
      <View className='index'>
        {
          showEvent ? <View catchtouchmove={this.preventTouchMove}>
            <View className='mask' onClick={() => this.hideMask()}></View>
            <View className='mask--wrapper'>
              <View className='mask--content'>
                <View className='title'>校无忧上线活动</View>
                <View className='desc'>1.因微信端问题，现发布订单需提前充值。充值金额也可直接提现。</View>
                <View className='desc'>2.首次充值送代金(代金可直接支付订单)</View>
                <View className='desc'>充20元送2元代金</View>
                <View className='desc'>充50元送10元代金</View>
                <View className='desc'>充100元送15元代金</View>
                <View className='desc'>3.活动持续到2019年9月9日</View>
                <View className='check' onClick={this.handleEventOk}>确定</View>
              </View>
            </View>
          </View> : null
        }
        <View className='top'>
          <View className='time'>{getTime()}</View>
          <View className='right' onClick={() => this.routeToImList()}>
            <Image src={require('../../assets/image/ic_message.png')} className='icon' />
            {
              messageLength > Taro.getStorageSync('messageReaded') && <View className='dot'></View>
            }
          </View>
        </View>
        <View className='title--wrapper'>
          <Text className='title'>{getDay()}好。</Text>
        </View>
        <Banner banners={this.state.banners} />
        <View className='service--wrapper'>
          <Text className='alias'>Service</Text>
          <Text className='title'>服务</Text>
          <View className='items'>
            {
              services.map((item, index) =>
                <View
                  className='item'
                  key={index}
                  style={{ backgroundImage: `url(${item.cover})` }}
                  onClick={() => this.routeToChildPage(index)}
                >
                  <View className='info'>
                    <Text className='name'>{item.name}</Text>
                    <Text className='desc'>{item.desc}</Text>
                  </View>
                </View>
              )
            }
          </View>
        </View>
      </View>
    )
  }
}
