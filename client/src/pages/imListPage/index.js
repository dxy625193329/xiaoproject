import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'
import { get, set } from '../../lib/global';
import { getMessageList } from '../../api'

export default class ImListPage extends Component {

  config = {
    navigationBarTitleText: '留言'
  }

  state = {
    messageList: []
  }

  componentDidShow() {
    this.fetchData()
  }

  fetchData = () => {
    getMessageList({ openId: get('openid') }).then(res => {
      if (res.data.code === 200) {
        const { messageList } = res.data
        this.setState({ messageList: messageList })
      }
    })
  }

  goMessage = item => {
    set('messageItem', item)
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
            </View>
          })
        }
      </View>
    )
  }
}
