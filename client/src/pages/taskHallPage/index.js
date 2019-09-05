import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import TaskCard from '../../components/TaskCard'
import './index.scss'
import { getOrderListForHunt } from '../../api'

export default class TaskHallPage extends Component {

  state = {
    taskList: [],
    sortedPriceList: [],
    sortedTimeList: [],
    sortedTypeList: [],
    timer: null
  }

  componentDidMount() {
    this.setState({
      timer: setInterval(() => {
        this.fetchData()
      }, 15000)
    })
  }

  componentDidShow() {
    this.fetchData()
  }

  componentWillUnmount() {
    clearInterval(this.state.timer)
  }

  fetchData = () => {
    getOrderListForHunt().then(res => {
      if (res.data.code === 200) {
        this.setState({
          taskList: res.data.data.orderList.reverse(),
          sortedPriceList: this.sortList(res.data.data.orderList, 'price'),
          sortedTimeList: this.sortList(res.data.data.orderList, 'orderStamp'),
          sortedTypeList: this.sortList(res.data.data.orderList, 'type')
        })
      }
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