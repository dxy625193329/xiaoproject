import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import TaskCard from '../../components/TaskCard'
import './index.scss'
import { getNowDay } from '../../lib/time'
import { get } from '../../lib/global'
import { getOrderListForHunt, getUserByOpenId, updateUser } from '../../api'

export default class TaskHallPage extends Component {

  config = {
    enablePullDownRefresh: true,
    backgroundTextStyle: "dark"
  }

  state = {
    taskList: [],
    sortedPriceList: [],
    sortedTimeList: [],
    sortedTypeList: [],
    timer: null
  }

  onPullDownRefresh() {
    this.fetchData()
    Taro.stopPullDownRefresh()
  }

  componentDidMount() {
    this.fetchData()
    this.setState({
      timer: setInterval(() => {
        this.fetchData()
      }, 5000)
    })
  }

  componentWillUnmount(){
    clearInterval(this.state.timer)
  }

  fetchData = () => {
    const openId = get('openid')
    Taro.showNavigationBarLoading()
    getOrderListForHunt().then(res => {
      Taro.hideNavigationBarLoading()
      this.setState({
        taskList: res.data.data.orderList.reverse(),
        sortedPriceList: this.sortList(res.data.data.orderList, 'price'),
        sortedTimeList: this.sortList(res.data.data.orderList, 'orderStamp'),
        sortedTypeList: this.sortList(res.data.data.orderList, 'type')
      })
    })
    getUserByOpenId({ openId }).then(res => {
      const { user } = res.data.data
      let quest = user.dayQuest
      if (quest.length > 0) {
        for (let i = 0; i < quest.length; i++) {
          if (quest[i].time == getNowDay()) {
            return
          } else {
            quest.push({ time: getNowDay(), order: [] })
          }
        }
      } else {
        quest.push({ time: getNowDay(), order: [] })
      }
      user.dayQuest = quest
      updateUser({ user })
    })

  }

  sortByTime = () => {
    let sort = this.state.sortedTimeList
    this.setState({ taskList: sort.reverse() })
  }

  sortByType = () => {
    let sort = this.state.sortedTypeList
    this.setState({ taskList: sort.reverse() })
  }

  sortByPrice = () => {
    let sort = this.state.sortedPriceList
    this.setState({ taskList: sort.reverse() })
  }

  sortList = (list, prop) => {
    if (!list.length > 0) return
    let tempList = [...list]
    tempList.sort((a, b) => {
      if (a[prop] < b[prop]) {
        return 1
      } else if (a[prop] > b[prop]) {
        return -1
      }
      return 0
    })
    return tempList
  }

  render() {

    const { taskList } = this.state

    return (
      <View className='taskhall'>
        <View className='taskhall--title'>任务大厅</View>
        <View className='taskhall--info'>请各位猎人根据自身情况接取任务</View>
        <View className='taskhall--sort--wrapper'>
          <View className='taskhall--sort--item' onClick={this.sortByTime}>
            <View className='item--text'>时间</View>
            <Image src={require('../../assets/image/ic_sort.png')} className='item--icon' />
          </View>
          <View className='taskhall--sort--item' onClick={this.sortByType}>
            <View className='item--text'>类型</View>
            <Image src={require('../../assets/image/ic_sort.png')} className='item--icon' />
          </View>
          <View className='taskhall--sort--item' onClick={this.sortByPrice}>
            <View className='item--text'>金额</View>
            <Image src={require('../../assets/image/ic_sort.png')} className='item--icon' />
          </View>
        </View>
        <View className='taskhall--tasks'>
          {
            taskList.map(item =>
              <TaskCard info={item} key={item._id} />
            )
          }
        </View>
      </View>
    )
  }
}