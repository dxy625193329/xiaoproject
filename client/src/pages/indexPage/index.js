import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

import { getTime, getDay, getNowDay } from '../../lib/time'
import { set } from '../../lib/global'
import { toast } from '../../lib/utils'

import { getUserByOpenId, updateUser, getMessageList, getBanner } from '../../api'

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
  },
  {
    name: '校园投票',
    desc: '当前板块可发布校园内的投票活动',
    cover: 'http://cdn.xwuyou.com/service_3.jpg'
  }
]

export default class IndexPage extends Component {

  state = {
    banners: [],
    phoneNumber: '',
    showEvent: false,
    timer: null,
    messageLength: 0,
  }

  componentWillMount() {
    const dontShowEvent = Taro.getStorageSync('dontShowEvent')
    if (!dontShowEvent) {
      Taro.hideTabBar()
      this.setState({ showEvent: true })
    }
  }

  componentDidMount() {
    getBanner().then(res => this.setState({
      banners: res.data.data.eventList
    })).catch(err => {
      console.log(err)
      toast('请检查您的网络状态', 'none')
    })
    const openId = Taro.getStorageSync('openid')
    if (openId) {
      setInterval(this.fetchIm, 15000)
    }
  }

  componentDidShow() {
    if (Taro.getStorageSync('openid')) {
      this.fetchData()
      this.fetchIm()
    }
  }

  componentDidHide() {
    clearInterval(this.state.timer)
  }

  fetchIm = () => {
    getMessageList({ openId: Taro.getStorageSync('openid') }).then(res => {
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

  routeToChildPage = index => {
    const phoneNumber = Taro.getStorageSync('phone')
    if (index === 2) {
      if (Taro.getStorageSync('openid')) {
        Taro.navigateTo({
          url: '/pages/voteListPage/index'
        })
        return
      } else {
        Taro.showModal({
          title: '提示',
          content: '参加投票需要登录',
          confirmText: '前往登录',
        }).then(res => {
          if (res.confirm) {
            Taro.switchTab({
              url: '/pages/mePage/index'
            })
          }
        })
      }
    } else {
      if (phoneNumber) {
        if (index === 0) {
          Taro.navigateTo({
            url: '/pages/orderTypePage/index'
          })
        } else if (index === 1) {
          Taro.navigateTo({
            url: '/pages/taskHallPage/index'
          })
        }
      } else {
        Taro.showModal({
          title: '提示',
          content: '发单、接单都需要登录并授权手机号码',
          confirmText: '前往登录',
        }).then(res => {
          if (res.confirm) {
            Taro.switchTab({
              url: '/pages/mePage/index'
            })
          }
        })
      }
    }
  }

  routeToImList = () => {
    Taro.navigateTo({
      url: '/pages/imListPage/index'
    })
  }

  fetchData = () => {
    const openId = Taro.getStorageSync('openid')
    getUserByOpenId({ openId }).then(res => {
      const { user } = res.data.data
      const { isHunter, dayQuest } = user
      set('user', user)
      set('isHunter', isHunter)
      if (dayQuest.length) {
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
      } else {
        const dayQuest = {
          date: getNowDay(),
          order: [],
          quest1: false,
          quest2: false,
          quest3: false
        }
        user.dayQuest = dayQuest
        updateUser({ user })
      }
    }).catch(err => {
      toast('请检查您的网络状态')
    })
  }

  handleEventOk = () => {
    this.setState({ showEvent: false })
    Taro.setStorageSync('dontShowEvent', true)
    Taro.showTabBar()
  }

  hideMask = () => {
    this.setState({ showEvent: false })
  }

  render() {
    const { showEvent, messageLength, banners } = this.state
    return (
      <View className='index'>
        {
          showEvent ? <View catchtouchmove={this.preventTouchMove}>
            <View className='mask' onClick={() => this.hideMask()}></View>
            <View className='mask--wrapper'>
              <View className='mask--content'>
                <View className='title'>校园投票功能全新上线！</View>
                <View className='desc'>1.第二届“最受欢迎社团”投票活动火热进行中，快来为你喜欢的社团投票吧！</View>
                <View className='desc'>（报名窗口持续开放中，欢迎加入活动）</View>
                <View className='desc'>2.充值20送代金1元</View>
                <View className='desc'>充值50元送代金3元</View>
                <View className='desc'>充值100元送代金8元</View>
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
        <Banner banners={banners} />
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
