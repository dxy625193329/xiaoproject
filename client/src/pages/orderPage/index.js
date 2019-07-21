import Taro, { Component } from '@tarojs/taro'
import {
  View,
  Text
} from '@tarojs/components'

import { get, set } from '../../lib/global'
import { getUserByOpenId } from '../../api'

import TaskCard from '../../components/TaskCard'
import './index.scss'

export default class OrderPage extends Component {

  config = {
    navigationBarTitleText: '订单',
    enablePullDownRefresh: true,
    backgroundTextStyle: "dark"
  }

  state = {
    currentIndex: 0,
    userOrderList: [],
    hunterOrderList: []
  }

  onPullDownRefresh() {
    this.fetchData()
    Taro.stopPullDownRefresh()
  }

  componentDidShow() {
    this.fetchData()
  }

  handleSelectTab = index => {
    let currentClass = this.state.currentIndex === index ? 'title' : 'sm-title'
    return index === 0 ? currentClass += ' mg--r' : currentClass += ' mg--l'
  }

  fetchData = () => {
    const openId = get('openid')
    Taro.showNavigationBarLoading()
    getUserByOpenId({ openId }).then(res => {
      Taro.hideNavigationBarLoading()
      this.setState({
        userOrderList: res.data.data.user.userOrder.reverse(),
        hunterOrderList: res.data.data.user.hunterOrder.reverse()
      })
      set('user', res.data.data.user)
    })
  }

  render() {

    const {
      currentIndex,
      userOrderList,
      hunterOrderList
    } = this.state

    return (
      <View className='order'>
        <View className='order--tabs'>
          <Text
            className={this.handleSelectTab(0)}
            onClick={() => this.setState({ currentIndex: 0 })}
          >普通订单</Text>
          <Text
            className={this.handleSelectTab(1)}
            onClick={() => this.setState({ currentIndex: 1 })}
          >猎人订单</Text>
        </View>
        <View className='order--content'>
          <View
            style={{ display: currentIndex === 0 ? 'block' : 'none' }}
          >
            {
              userOrderList.map(order =>
                <TaskCard info={order} key={order._id} />
              )
            }
          </View>
          <View
            style={{ display: currentIndex === 1 ? 'block' : 'none' }}
          >
            {
              hunterOrderList.map(order =>
                <TaskCard info={order} key={order._id} />
              )
            }
          </View>
        </View>
      </View>
    )
  }
}
