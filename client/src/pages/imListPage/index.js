import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'

export default class RankPage extends Component {

  config = {
    navigationBarTitleText: '信息列表'
  }

  state = {

  }

  render() {

    return (
      <View className='im__list'>
        imlist
      </View>
    )
  }
}
