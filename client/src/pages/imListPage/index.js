import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'
import { get, set } from '../../lib/global'
import { formatStringTime } from '../../lib/time'
import { getMessageList } from '../../api'

export default class ImListPage extends Component {

  config = {
    navigationBarTitleText: '留言'
  }

  state = {
    messageList: [],
    messageLength: 0
  }

  componentDidShow() {
    this.fetchData()
  }

  componentWillUnmount() {
    Taro.setStorageSync('messageReaded', this.state.messageLength)
  }

  fetchData = () => {
    getMessageList({ openId: get('openid') }).then(res => {
      if (res.data.code === 200) {
        let { messageList } = res.data
        let length = 0
        if (messageList.length > 0) {
          for (let i = 0; i < messageList.length; i++) {
            length += messageList[i].message.length
          }
          messageList = messageList.sort((a, b) => {
            return formatStringTime(b.message[b.message.length - 1].sendTime) - formatStringTime(a.message[a.message.length - 1].sendTime)
          })
        }
        this.setState({ messageList: messageList, messageLength: length })
      }
    })
  }

  goMessage = item => {
    set('messageItem', item)
    const messageRecent = JSON.parse(Taro.getStorageSync('messageRecent'))
    messageRecent[item.byId] = item.message[item.message.length - 1].sendTime
    Taro.setStorageSync('messageRecent', JSON.stringify(messageRecent))
    Taro.navigateTo({
      url: '/pages/messagePage/index'
    })
  }

  render() {

    const { messageList } = this.state
    const openId = get('openid')

    return (
      <View className='im__list'>
        {
          messageList.length > 0 && messageList.map((item, index) => {
            return <View className='im-item' onClick={() => this.goMessage(item)} key={index}>
              {item.byId === openId ? <Image src={item.toAvatar} className='avatar' /> : <Image src={item.fromAvatar} className='avatar' />}
              <View className='right'>
                <View className='name'>{item.byId === openId ? item.toName : item.fromName}</View>
                <View className='message'>{item.message[item.message.length - 1].type === 'image' ? '图片' : item.message[item.message.length - 1].message}</View>
              </View>
              <View className='time'>{item.message[item.message.length - 1].sendTime.split(' ')[1]}</View>
              {
                JSON.parse(Taro.getStorageSync('messageRecent'))[item.byId] !== item.message[item.message.length - 1].sendTime && <View className='new'></View>
              }
            </View>
          })
        }
      </View>
    )
  }
}
