import Taro, { Component } from '@tarojs/taro'
import {
  View,
  Text,
} from '@tarojs/components'

import {
  getTime,
  getDay,
  getNowDay
} from '../../lib/time'
import { set, get } from '../../lib/global'
import { toast } from '../../lib/utils'

import {
  getUserByOpenId,
  getBanner,
  updateUser
} from '../../api'

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
  }

  componentDidShow() {
    this.fetchData()
  }

  routeToChildPage = id => {
    const localPhoneNumber = Taro.getStorageSync('phone')
    let phoneNumber = localPhoneNumber ? localPhoneNumber : ''
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

  fetchData = () => {
    getBanner().then(res => this.setState({
      banners: res.data.data.eventList
    })).catch(err => {
      toast('请检查您的网络状态', 'none')
    })
    getUserByOpenId({ openId: get('openid') }).then(res => {
      const { user } = res.data.data
      const { isHunter, dayQuest } = res.data.data.user
      set('user', user)
      set('isHunter', isHunter)
      if (dayQuest) {
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
      }
    }).catch(err => {
      toast('请检查您的网络状态', 'none')
    })
  }

  render() {
    return (
      <View className='index'>
        <View>
          <View className='top'>
            <View className='time'>{getTime()}</View>
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
      </View>
    )
  }
}
