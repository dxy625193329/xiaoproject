import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'
import { get, set } from '../../lib/global';

export default class ImListPage extends Component {

  config = {
    navigationBarTitleText: '留言'
  }

  state = {
    messageList: []
  }

  componentDidMount() {
    this.setState({ messageList: get('message') })
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
              <View className='message'>{item.message[item.message.length - 1].message}</View>
            </View>
          })
        }
      </View>
    )
  }
}
