import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './index.scss'

export default class RankCard extends Component {

  state = {
    userInfo: {},
    rankIndex: 0,
  }

  componentDidMount() {
    this.setState({
      userInfo: this.props.user,
      rankIndex: this.props.index,
    })
  }

  static getDerivedStateFromProps(props, state) {
    if (props.user !== state.userInfo) {
      return {
        userInfo: props.user
      }
    }
    return null
  }

  render() {
    const { userInfo, rankIndex } = this.state
    return (
      <View className='rank--card'>
        {
          rankIndex === 0 ?
            <Image src={require('../../assets/image/ic_cup_gold.png')} className='cup' /> : rankIndex === 1 ?
              <Image src={require('../../assets/image/ic_cup_silver.png')} className='cup' /> : rankIndex === 2 ?
                <Image src={require('../../assets/image/ic_cup_bronze.png')} className='cup' /> : <View className='block'></View>
        }
        <View className='rank'>#{rankIndex + 1}</View>
        <Image src={userInfo.userAvatar} className='avatar' />
        <View className='name'>{userInfo.userName}</View>
        <View className='level'>{userInfo.userLevel.name}</View>
        <View className='number'>{userInfo.userOrderCount}单</View>
      </View>
    )
  }
}