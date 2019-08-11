import Taro, { Component } from '@tarojs/taro'
import { View, Input } from '@tarojs/components'
import './index.scss'
import { get, set } from '../../lib/global';
import { getFullTime } from '../../lib/time';
import { addAndUpdateMessage } from '../../api'
import { toast } from '../../lib/utils';

export default class MessagePage extends Component {

  state = {
    messageObj: {},
    messageList: [],
    message: '',
    messageLocalList: [],
    openId: ''
  }

  componentDidMount() {
    this.setState({ messageObj: get('messageItem'), messageLocalList: Taro.getStorageSync('message') || [], openId: get('openid'), messageList: get('messageItem').message || [] })
    Taro.setNavigationBarTitle({
      title: get('messageItem').byId === get('openid') ? get('messageItem').toName : get('messageItem').fromName
    })
  }


  handleMessageChange = e => {
    this.setState({ message: e.target.value })
  }

  componentWillUnmount() {
    Taro.switchTab({
      url: '/pages/indexPage/index'
    })
  }

  handleMessageSubmit = e => {
    const { messageObj } = this.state
    const messageItem = {
      fromName: messageObj.fromName,
      fromId: messageObj.fromId,
      fromAvatar: messageObj.fromAvatar,
      message: e.target.value,
      sendTime: getFullTime()
    }
    const tempMessageList = [...this.state.messageList, messageItem]
    const message = {
      fromId: messageObj.fromId,
      toId: messageObj.toId,
      fromAvatar: messageObj.fromAvatar,
      toAvatar: messageObj.toAvatar,
      fromName: messageObj.fromName,
      toName: messageObj.toName,
      message: tempMessageList,
      hunterId: messageObj.hunterId,
      byId: messageObj.byId
    }
    addAndUpdateMessage({ message }).then(res => {
      if (res.data.code == 200) {
        if (!this.state.messageLocalList.includes(messageObj.toId)) {
          const tempList = this.state.messageLocalList
          tempList.push(messageObj.toId)
          Taro.setStorageSync('message', tempList)
          this.setState({ messageLocalList: tempList })
        }
        this.setState({
          messageList: tempMessageList,
          message: ''
        })
        set('messageItem', message)
      } else {
        toast('请检查您的网络环境后重试', 'none')
      }
    })
  }

  render() {
    const { messageList, openId, messageObj } = this.state

    return (
      <View className='message'>
        <View className='message-wrapper'>
          {
            messageList.length > 0 && messageList.map((item, index) => {
              return <View key={index} className='message-item'>
                <View className='top'>
                  <Image src={item.fromAvatar} className='avatar' />
                  <View className='name'>{item.fromName}</View>
                  <View className='type'>{messageObj.hunterId !== openId ? '用户' : '猎人'}</View>
                  <View className='time'>{item.sendTime}</View>
                </View>
                <View className='box' style={{ background: openId === item.fromId ? '#9EEA6A' : '#fff' }}>
                  {item.message}
                </View>
              </View>
            })
          }
        </View>
        <View className='input-wrapper'>
          <Input
            className='input'
            placeholder='在此输入留言信息'
            cursor-spacing='40px'
            confirmType='send'
            value={this.state.message}
            onConfirm={this.handleMessageSubmit}
            onInput={this.handleMessageChange}
          />
        </View>
      </View>
    )
  }
}
