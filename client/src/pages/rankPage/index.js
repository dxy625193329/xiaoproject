import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

import { getRankList } from '../../api'

import RankCard from '../../components/RankCard'
import HunterRankCard from '../../components/HunterRankCard'
import './index.scss'

export default class RankPage extends Component {

  config = {
    navigationBarTitleText: '排行榜'
  }

  state = {
    currentIndex: 0,
    userList: [],
    hunterList: [],
  }

  componentDidShow() {
    this.fetchData()
  }

  handleSelectTab = index => {
    let currentClass = this.state.currentIndex === index ? 'title' : 'sm-title'
    return index === 0 ? currentClass += ' mg--r' : currentClass += ' mg--l'
  }

  fetchData = () => {
    getRankList().then(res => {
      this.setState({
        userList: res.data.data.userList,
        hunterList: res.data.data.hunterList
      })
    })
  }

  render() {
    const { currentIndex, userList, hunterList } = this.state
    return (
      <View className='rank'>
        <View className='rank--tabs'>
          <Text
            className={this.handleSelectTab(0)}
            onClick={() => this.setState({ currentIndex: 0 })}
          >普通排行</Text>
          <Text
            className={this.handleSelectTab(1)}
            onClick={() => this.setState({ currentIndex: 1 })}
          >猎人排行</Text>
        </View>
        <View className='rank--info'>排行榜每月1日更新，奖励机制将在后续版本中更新</View>
        <View className='rank--content'>
          <View
            style={{ display: currentIndex === 0 ? 'block' : 'none' }}
          >
            {
              userList.map((user, index) =>
                <RankCard
                  user={user}
                  key={user._id}
                  index={index}
                />
              )
            }
          </View>
          <View
            style={{ display: currentIndex === 1 ? 'block' : 'none' }}
          >
            {
              hunterList.map((user, index) =>
                <HunterRankCard
                  user={user}
                  key={user._id}
                  index={index}
                />
              )
            }
          </View>
        </View>
      </View>
    )
  }
}
