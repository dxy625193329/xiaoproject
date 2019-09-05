import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

import { get } from '../../lib/global'
import { fromNow } from '../../lib/time'
import { getServiceByOpenId } from '../../api'

import './index.scss'

export default class OrderPage extends Component {

  state = {
    serviceList: [],
    serviceReaded: 0
  }

  componentDidShow() {
    this.fetchData()
  }

  fetchData = () => {
    const openId = get('openid')
    const serviceReaded = Taro.getStorageSync('serviceReaded')
    getServiceByOpenId({ openId }).then(res => {
      const list = res.data.data.serviceList
      this.setState({
        serviceList: list.reverse(),
        serviceReaded
      })
    })
  }

  componentWillUnmount() {
    Taro.setStorageSync('serviceReaded', this.state.serviceList.length)
  }

  render() {
    const { serviceList, serviceReaded } = this.state
    return (
      <View className='service'>
        <View className='service--title'>客服</View>
        <View className='service--info'>在此您可查看一些官方的客服信息</View>
        <View className='service--content'>
          {
            serviceList.map((service, index) =>
              <View className="service--card" key={service._id}>
                <View className="top">
                  {
                    index < serviceList.length - serviceReaded && <View className='new'></View>
                  }
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
