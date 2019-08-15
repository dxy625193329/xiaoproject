import Taro, { Component, getCurrentPages } from '@tarojs/taro'
import { View, Input, ScrollView } from '@tarojs/components'
import './index.scss'
import { get, set } from '../../lib/global';
import { getFullTime } from '../../lib/time';
import { addAndUpdateMessage, getMessageList } from '../../api'
import { toast } from '../../lib/utils';

export default class MessagePage extends Component {

  state = {
    messageObj: {},
    messageList: [],
    message: '',
    messageLocalList: [],
    openId: '',
    user: {},
    uploadImageUrl: '',
    fromPage: '',
    timer: null,
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: get('messageItem').byId === get('openid') ? get('messageItem').toName : get('messageItem').fromName
    })
    const pages = getCurrentPages()
    this.setState({
      messageObj: get('messageItem'),
      messageLocalList: Taro.getStorageSync('message') || [],
      openId: get('openid'),
      messageList: get('messageItem').message || [],
      user: get('user'),
      timer: setInterval(this.getOnlineMessage, 5000),
      fromPage: pages[pages.length - 2].route,
    })
    this.pageScrollToBottom()
  }

  getOnlineMessage = () => {
    getMessageList({ openId: get('openid') }).then(res => {
      if (res.code === 200) {
        const { messageList } = res.data
        const nowMessage = messageList.filter(item => {
          return item.byId === get('messageItem').byId && item.toId === get('messageItem').toId
        })
        this.setState({
          messageList: nowMessage.length > 0 ? nowMessage[0].message : []
        })
      }
    })
  }

  pageScrollToBottom = () => {
    Taro.createSelectorQuery().select('#message').boundingClientRect(rect => {
      Taro.pageScrollTo({
        scrollTop: rect.bottom
      })
    }).exec()
  }

  handleMessageChange = e => {
    this.setState({ message: e.target.value })
  }

  componentWillUnmount() {
    clearInterval(this.state.timer)
    if (this.state.fromPage !== 'pages/imListPage/index') {
      Taro.switchTab({
        url: '/pages/indexPage/index'
      })
    }
  }

  handleMessageSubmit = e => {
    const { messageObj, user, messageList } = this.state
    const messageItem = {
      fromName: user.userName,
      fromId: user.openId,
      fromAvatar: user.userAvatar,
      message: e.target.value,
      type: 'text',
      sendTime: getFullTime()
    }
    const tempMessageList = [...messageList, messageItem]
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
        const tempList = this.state.messageLocalList
        if (messageObj.byId === this.state.openId) {
          if (!this.state.messageLocalList.includes(messageObj.toId)) {
            tempList.push(messageObj.toId)
          }
        }
        Taro.setStorageSync('message', tempList)
        this.setState({
          messageLocalList: tempList,
          messageList: tempMessageList,
          message: ''
        })
        set('messageItem', message)
        this.pageScrollToBottom()
      } else {
        toast('请检查您的网络环境后重试', 'none')
      }
    })
  }

  handleImageChoose = e => {
    const { messageObj, user } = this.state
    Taro.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera']
    }).then(res => {
      Taro.uploadFile({
        url: 'https://xwuyou.com/api/upload',
        filePath: res.tempFilePaths[0],
        name: 'himg'
      }).then(res => {
        const messageItem = {
          fromName: user.userName,
          fromId: user.openId,
          fromAvatar: user.userAvatar,
          message: res.data,
          type: 'image',
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
            const tempList = this.state.messageLocalList
            if (messageObj.byId === this.state.openId) {
              if (!this.state.messageLocalList.includes(messageObj.toId)) {
                tempList.push(messageObj.toId)
              }
            } else {
              if (!this.state.messageLocalList.includes(messageObj.fromId)) {
                tempList.push(messageObj.fromId)
              }
            }
            Taro.setStorageSync('message', tempList)
            this.setState({
              messageLocalList: tempList,
              messageList: tempMessageList,
            })
            set('messageItem', message)
            this.pageScrollToBottom()
          } else {
            toast('请检查您的网络环境后重试', 'none')
          }
        })
      })
    })
  }

  showImage = e => {
    Taro.previewImage({
      current: e.currentTarget.dataset.src,
      urls: [e.currentTarget.dataset.src]
    })
  }

  render() {
    const { messageList, openId, messageObj } = this.state

    return (
      <View className='message'>
        <View className='message-wrapper' id='message'>
          {
            messageList.length > 0 && messageList.map((item, index) => {
              return openId !== item.fromId ?
                <View key={index} className='message-item'>
                  <View className='top'>
                    <Image src={item.fromAvatar} className='avatar' />
                    <View className='info'>
                      <View className='name'>{item.fromName}</View>
                      {
                        messageObj.hunterId === item.fromId ? <View className='type type-hunter'>猎人</View> : <View className='type'>用户</View>
                      }
                    </View>
                  </View>
                  {
                    item.type === 'text' ? <View className='box' style={{ background: '#fff' }}>
                      {item.message}
                    </View> : <View className='image-box' style={{ background: '#fff' }}>
                        <Image src={item.message} className='image' onClick={this.showImage} data-src={item.message} />
                      </View>
                  }
                  <View className='time'>{item.sendTime}</View>
                </View> :
                <View key={index} className='message-item'>
                  <View className='reverse-top'>
                    <View className='info'>
                      <View className='name'>{item.fromName}</View>
                      {
                        messageObj.hunterId === item.fromId ? <View className='type type-hunter'>猎人</View> : <View className='type'>用户</View>
                      }
                    </View>
                    <Image src={item.fromAvatar} className='avatar' />
                  </View>
                  {
                    item.type === 'text' ? <View className='reverse-box' style={{ background: '#9EEA6A' }}>
                      {item.message}
                    </View> : <View className='reverse-image-box' style={{ background: '#9EEA6A' }}>
                        <Image src={item.message} className='image' onClick={this.showImage} data-src={item.message} />
                      </View>
                  }
                  <View className='reverse-time'>{item.sendTime}</View>
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
          <Image src={require('../../assets/image/ic_photo.png')} className='select-photo' onClick={this.handleImageChoose} />
        </View>
      </View>
    )
  }
}
