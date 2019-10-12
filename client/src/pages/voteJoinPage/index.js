import Taro, { Component } from '@tarojs/taro'
import { View, Input, Image } from '@tarojs/components'
import './index.scss'
import { addService, addPlayer } from '../../api'
import { toast } from '../../lib/utils';
import { get } from '../../lib/global';

export default class VoteJoinPage extends Component {

  state = {
    name: '',
    idCardNumber: '',
    tempImageUrl1: '',
  }

  handleImageChoose = e => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera']
    }).then(res => {
      this.setState({ tempImageUrl1: res.tempFilePaths[0] })
    })
  }

  handleInputChange = e => {
    this.setState({ [e.target.id]: e.target.value })
  }

  handleBtnClick = () => {
    const { name, tempImageUrl1 } = this.state
    const openId = Taro.getStorageSync('openid')
    if (name && tempImageUrl1) {
      Taro.showLoading({
        title: '正在上传......',
        mask: true
      })

      let uploadList = [tempImageUrl1].map(path => {
        return Taro.uploadFile({
          url: 'https://xwuyou.com/api/upload',
          filePath: path,
          name: 'himg'
        })
      })

      Promise.all(uploadList).then(res => {
        const player = {
          openId,
          name,
          image: res[0].data,
          voteId:get('voteId'),
          voteName:get('voteName')
        }
        addPlayer({ player }).then(res => {
          if (res.data.code === 200) {
            Taro.hideLoading()
            toast('提交审核成功')
            setTimeout(() => {
              Taro.switchTab({
                url: '/pages/indexPage/index'
              })
            }, 1000)
          }
        })
        const service = {
          openId,
          title: '您的投票活动审核已成功提交',
          content: '请您耐心等待，我们的工作人员会尽快进行审核。'
        }
        addService({ service })
      }).catch(err => {
        toast('上传文件失败，请检查您的网络环境后再试')
        Taro.hideLoading()
      })
    }
  }


  render() {
    const { name, tempImageUrl1 } = this.state

    return (
      <View className='vote-join'>
        <View className='vote--title'>申请参加投票活动</View>
        <View className='vote--info'>请按规则填写您的资料以提供审核</View>
        <View>
          <View className='vote--input-wrapper'>
            <Input
              id="name"
              value={name}
              placeholder='输入参加投票的主体名称'
              onInput={this.handleInputChange}
            />
          </View>
          <View
            id="image1"
            className='vote--upload'
            onClick={this.handleImageChoose}
          >
            {
              tempImageUrl1 === '' ? <View className='text'>点击此处上传您的展示图片</View> :
                <Image src={tempImageUrl1} className='image' />
            }
          </View>
          <View
            className='vote--btn'
            onClick={this.handleBtnClick}
          >提交审核</View>
        </View>
      </View>
    )
  }
}
