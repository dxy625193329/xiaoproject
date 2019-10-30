import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'
import { fromNow } from '../../lib/time'
import { set } from '../../lib/global'

export default class TaskCard extends Component {
  state = {
    taskInfo: {}
  }

  componentWillMount() {
    this.setState({ taskInfo: this.props.info })
  }

  componentDidUpdate() {
    this.setState({ taskInfo: this.props.info })
  }

  checkStatus = status => {
    switch (status) {
      case 'complete':
        return require('../../assets/image/ic_check_circle.png')
      case 'wait':
        return require('../../assets/image/ic_wait_circle.png')
      case 'process':
        return require('../../assets/image/ic_process_circle.png')
      case 'confirm':
        return require('../../assets/image/ic_process_circle.png')
    }
  }

  checkType = type => {
    switch (type) {
      case 1:
        return 'type--normal'
      case 2:
        return 'type--shadow'
      case 3:
        return 'type--express'
    }
  }

  handleCardClick = () => {
    set('order', this.state.taskInfo)
    Taro.navigateTo({
      url: '/pages/orderDetailPage/index'
    })
  }


  render() {
    const { taskInfo } = this.state
    return (
      <View className="task--card" onClick={this.handleCardClick}>
        <View className="top">
          <Image src={this.checkStatus(taskInfo.status)} className='status' />
          <View className="title">{taskInfo.statusText}</View>
          <Text className='time'>{fromNow(taskInfo.orderStamp)}</Text>
        </View>
        <View className="middle">
          <Text className='desc'>订单类别</Text>
          <Text className={['type', this.checkType(taskInfo.type)]}>{taskInfo.typeText}</Text>
          {
            (taskInfo.type === 3 && taskInfo.needSpeed) && (
              <block>
                <Text className='desc'>加急状态</Text>
                <Text className='speed-type'>急</Text>
              </block>
            )
          }
          {
            taskInfo.type === 3 ? (<block>
              <Text className='desc'>快递点</Text>
              <Text className='need'>{taskInfo.siteText}</Text>
              <Text className='desc'>快递大小</Text>
              <Text className='need'>{taskInfo.sizeText}</Text>
            </block>) : (<block>
              <Text className='desc'>需求简介</Text>
              <Text className='need'>{taskInfo.needText}</Text>
            </block>)
          }

          <Text className='text'>点击查看详情</Text>
          <View className='bottom'>
            <View className='total'>总计</View>
            <View className='right'>
              <Text className='sigal'>¥</Text>
              <Text className='price'>{taskInfo.price}</Text>
            </View>
          </View>
        </View>
        <View className="divider--bottom"></View>
      </View>
    )
  }
}