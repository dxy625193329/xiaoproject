import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'

import { getVoteList } from '../../api'
import { formatVoteTime } from "../../lib/time"

import './index.scss'
import { set } from '../../lib/global'

export default class VoteListPage extends Component {

  config = {
    navigationBarTitleText: '校园投票'
  }

  state = {
    currentIndex: 0,
    voteList: [],
  }

  componentDidMount() {
    this.fetchData()
  }

  componentDidShow() {
    this.fetchData()
  }


  fetchData = () => {
    getVoteList().then(res => {
      this.setState({
        voteList: res.data.data.voteList,
      })
    })
  }

  handleToVoteDetailPage = vote => {
    set('vote', vote)
    Taro.navigateTo({
      url: '/pages/voteDetailPage/index'
    })
  }

  render() {
    const { voteList } = this.state
    return (
      <View className='vote'>
        <View className='vote-list-wrapper'>
          {
            voteList.map((item, index) =>
              <View className='vote-item' key={index} onClick={() => this.handleToVoteDetailPage(item)}>
                <View className='vote-item-title'>{item.title}</View>
                <View className={['vote-item-status', item.time[1] > Date.now() ? 'active' : 'finish']}>{item.time[1] > Date.now() ? '进行中' : '已结束'}</View>
                <View className='vote-item-time'>投票开始时间：{formatVoteTime(item.time[0])}</View>
                <View className='vote-item-time'>投票截至时间：{formatVoteTime(item.time[1])}</View>
              </View>
            )
          }
        </View>
      </View>
    )
  }
}
