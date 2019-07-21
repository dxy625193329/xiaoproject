import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

import { get } from '../../lib/global'
import { fromNow } from '../../lib/time'
import { getServiceByOpenId } from '../../api'

import './index.scss'

export default class OrderPage extends Component {

  state = {
    serviceList: []
  }

  componentDidShow() {
    this.fetchData()
  }

  fetchData = () => {
    const openId = get('openid')
    getServiceByOpenId({ openId }).then(res => {
      const list = res.data.data.serviceList
      Taro.setStorageSync('serviceReaded', list.length)
      this.setState({
        serviceList: list.reverse()
      })
    })
  }

  render() {
    const { serviceList } = this.state
    return (
      <View className='service'>
        <View className='service--title'>客服</View>
        <View className='service--info'>在此您可查看一些官方的客服信息</View>
        <View className='service--content'>
          {
            serviceList.map(service =>
              <View className="service--card" key={service._id}>
                <View className="top">
                  <View className="title">{service.title}</View>
                  <Text className='time'>{fromNow(parseInt(service.createAt))}</Text>
                </View>
                <View className="content">
                  <Text className='desc'>{service.content}</Text>
                </View>
                <View className="divider--bottom"></View>
              </View>
            )
          }
        </View>
      </View>
    )
  }
}
