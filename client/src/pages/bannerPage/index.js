import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { get } from '../../lib/global'

export default class BannerPage extends Component {

  config = {
    usingComponents: {
      wemark: '../../wemark/wemark'
    }
  }

  state = {
    content: ''
  }

  componentDidMount() {
    this.setState({ content: get('banner').content })
  }

  render() {
    const { content } = this.state
    return (
      <View style={{ background: '#F8F8F8', minHeight: '100vh' }}>
        <wemark md={content} type='wemark' />
      </View>
    )
  }
}