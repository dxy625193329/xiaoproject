import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'

import { toast } from '../../lib/utils'
import { get } from '../../lib/global'
import { addFeedBack, addService } from '../../api'

export default class RankPage extends Component {

  state = {
    value: '',
    user: {}
  }

  componentDidMount() {
    this.setState({ user: get('user') })
  }

  handleInputChange = e => {
    this.setState({ value: e.target.value })
  }

  handleBtnClick = () => {
    const { user, value } = this.state
    if (value.length > 0) {
      const feed = {
        openId: user.openId,
        userName: user.userName,
        userAvatar: user.userAvatar,
        content: value,
      }
      addFeedBack({ feed }).then(res => {
        this.setState({ value: '' })
        const service = {
          openId: user.openId,
          title: '您的反馈已提交',
          content: '我们的工作人员会尽快对您的意见或建议进行回复。'
        }
        addService({ service }).then(res => {
          if (res.data.code === 200) {
            toast('您的反馈已提交', 'success')
            Taro.switchTab({
              url: '/pages/mePage/index'
            })
          }
        })
      })
    }
  }

  render() {

    const { value } = this.state

    return (
      <View className='feed__back'>
        <View className='feed__back--title'>意见或建议</View>
        <View className='feed__back--info'>在此处写下您的意见或建议，我们会第一时间查看</View>
        <Textarea
          className='feed__back--input'
          autoHeight
          value={value}
          placeholder='留下您宝贵的意见吧'
          onInput={this.handleInputChange}
        />
        <View
          className='feed__back--btn'
          onClick={this.handleBtnClick}
        >提交</View>
      </View>
    )
  }
}
