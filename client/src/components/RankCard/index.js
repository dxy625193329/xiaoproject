import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './index.scss'

export default class RankCard extends Component {

  state = {
    userInfo: {},
    rankIndex: 0,
    rankFlag: 0
  }

  componentWillMount() {
    this.setState({
      userInfo: this.props.user,
      rankIndex: this.props.index,
      rankFlag: this.props.flag
    })
  }

  render() {
    const { userInfo, rankIndex, rankFlag } = this.state

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
        <View className='level'>{rankFlag === 1 ? userInfo.userLevel.name : userInfo.hunterLevel.name}</View>
        <View className='number'>{rankFlag === 1 ? userInfo.userOrderCount : userInfo.hunterOrderCount}单</View>
      </View>
    )
  }
}