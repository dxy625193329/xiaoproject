import Taro, { Component } from '@tarojs/taro'
import { View, Input } from '@tarojs/components'
import './index.scss'
import { get } from '../../lib/global';

export default class MessagePage extends Component {

  state = {
    messageObj: {},
    message: '',
    messageList: [],
    user: {}
  }

  componentDidMount() {
    this.setState({ messageObj: get('messageObj'), user: get('user') })
    Taro.setNavigationBarTitle({
      title: get('messageObj').toName
    })
  }

  componentWillUnmount() {
    Taro.setStorageSync('messageList', this.state.messageList)
  }

  handleMessageChange = e => {
    this.setState({ message: e.target.value })
  }

  handleMessageSubmit = e => {
    const messageItem = {
      from: this.state.messageObj.from,
      to: this.state.messageObj.to,
      toName: this.state.messageObj.toName,
      toAvatar: this.state.messageObj.toAvatar,
      message: this.state.message
    }
    this.setState({ message: '', messageList: [...this.state.messageList, messageItem] })
  }

  renderMessage = () => {
    const { messageList, user } = this.state
    let msgView
    if (messageList.length > 0) {
      messageList.map((item, index) => {
        if (item.from === user.openId) {
          msgView = (
            <View className='me' key={index}>
              {item.message}
            </View>
          )
        } else {
          msgView = (
            <View className='me' key={index}>
              {item.message}
            </View>
          )
        }
      })
    }
    return msgView
  }

  render() {

    return (
      <View className='message'>
        <View className='message-wrapper'>
          {
            this.renderMessage()
          }
        </View>
        <View className='input-wrapper'>
          <Input
            className='input'
            placeholder='在此输入信息'
            value={this.state.message}
            onConfirm={this.handleMessageSubmit}
            onInput={this.handleMessageChange}
          />
        </View>
      </View>
    )
  }
}
