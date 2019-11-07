import Taro, { Component } from '@tarojs/taro'
import { View, Text, } from '@tarojs/components'

import { get } from '../../lib/global'
import { getOrderListByOpenId } from '../../api'

import TaskCard from '../../components/TaskCard'
import './index.scss'

export default class OrderPage extends Component {

  config = {
    navigationBarTitleText: '订单',
  }

  state = {
    currentIndex: 0,
    userOrderList: [],
    hunterOrderList: [],
    showOrderType: 1,
    showHunterType: 1
  }

  componentDidMount() {
    this.fetchData()
  }

  componentDidShow() {
    this.fetchData()
  }

  handleSelectTab = index => {
    let currentClass = this.state.currentIndex === index ? 'title' : 'sm-title'
    return index === 0 ? currentClass += ' mg--r' : currentClass += ' mg--l'
  }

  fetchData = () => {
    const openId = Taro.getStorageSync('openid')
    if (openId) {
      getOrderListByOpenId({ openId }).then(res => {
        if (res.data.code === 200) {
          this.setState({
            userOrderList: res.data.data.userOrderList.reverse(),
            hunterOrderList: res.data.data.hunterOrderList.reverse()
          })
        }
      })
    }
  }

  showOrder = flag => {
    this.setState({ showOrderType: flag })
  }

  showHunter = flag => {
    this.setState({ showHunterType: flag })
  }

  render() {
    const { currentIndex, userOrderList, hunterOrderList, showOrderType, showHunterType } = this.state
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
            <View className='type-select'>
              <View className={showOrderType === 1 ? 'type-item type-active' : 'type-item'} onClick={() => this.showOrder(1)}>全部</View>
              <View className={showOrderType === 2 ? 'type-item type-active' : 'type-item'} onClick={() => this.showOrder(2)}>未接单</View>
              <View className={showOrderType === 3 ? 'type-item type-active' : 'type-item'} onClick={() => this.showOrder(3)}>进行中</View>
              <View className={showOrderType === 4 ? 'type-item type-active' : 'type-item'} onClick={() => this.showOrder(4)}>待确认</View>
              <View className={showOrderType === 5 ? 'type-item type-active' : 'type-item'} onClick={() => this.showOrder(5)}>已完成</View>
            </View>
            {
              showOrderType === 1 && userOrderList.map(order =>
                <TaskCard info={order} key={order._id} />
              )
            }
            {
              showOrderType === 2 && userOrderList.filter(order => order.status === 'wait').map(order => <TaskCard info={order} key={order._id} />)
            }
            {
              showOrderType === 3 && userOrderList.filter(order => order.status === 'process').map(order => <TaskCard info={order} key={order._id} />)
            }
            {
              showOrderType === 4 && userOrderList.filter(order => order.status === 'confirm').map(order => <TaskCard info={order} key={order._id} />)
            }
            {
              showOrderType === 5 && userOrderList.filter(order => order.status === 'complete').map(order => <TaskCard info={order} key={order._id} />)
            }
          </View>
          <View
            style={{ display: currentIndex === 1 ? 'block' : 'none' }}
          >
            <View className='type-select'>
              <View className={showHunterType === 1 ? 'type-item type-active' : 'type-item'} onClick={() => this.showHunter(1)}>全部</View>
              <View className={showHunterType === 2 ? 'type-item type-active' : 'type-item'} onClick={() => this.showHunter(2)}>进行中</View>
              <View className={showHunterType === 3 ? 'type-item type-active' : 'type-item'} onClick={() => this.showHunter(3)}>待确认</View>
              <View className={showHunterType === 4 ? 'type-item type-active' : 'type-item'} onClick={() => this.showHunter(4)}>已完成</View>
            </View>
            {
              showHunterType === 1 && hunterOrderList.map(order =>
                <TaskCard info={order} key={order._id} />
              )
            }
            {
              showHunterType === 2 && hunterOrderList.filter(order => order.status === 'process').map(order => <TaskCard info={order} key={order._id} />)
            }
            {
              showHunterType === 3 && hunterOrderList.filter(order => order.status === 'confirm').map(order => <TaskCard info={order} key={order._id} />)
            }
            {
              showHunterType === 4 && hunterOrderList.filter(order => order.status === 'complete').map(order => <TaskCard info={order} key={order._id} />)
            }
          </View>
        </View>
      </View>
    )
  }
}
