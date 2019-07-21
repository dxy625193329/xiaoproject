import Taro, { Component } from '@tarojs/taro'
import { View, Input, Text, Image, Checkbox, CheckboxGroup } from '@tarojs/components'
import './index.scss'
import { addHunter, addService, getPay, updateUser, refundPay } from '../../api'
import { get } from '../../lib/global'
import { getNowDay } from '../../lib/time'

export default class BeHunterPage extends Component {

  state = {
    name: '',
    idCardNumber: '',
    tempImageUrl1: '',
    tempImageUrl2: '',
    tempImageUrl3: '',
    checked: false,
    user: {},
  }

  componentDidMount() {
    this.setState({ user: get('user') })
  }

  handleImageChoose = e => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera']
    }).then(res => {
      switch (e.currentTarget.id) {
        case 'image1':
          this.setState({ tempImageUrl1: res.tempFilePaths[0] })
          break
        case 'image2':
          this.setState({ tempImageUrl2: res.tempFilePaths[0] })
          break
        case 'image3':
          this.setState({ tempImageUrl3: res.tempFilePaths[0] })
          break
      }
    })
  }

  routeToAgreePage = () => {
    Taro.navigateTo({
      url: '/pages/hunterAgreePage/index'
    })
  }

  handleInputChange = e => {
    this.setState({ [e.target.id]: e.target.value })
  }

  handleCheckBoxChange = e => {
    let checked = e.target.value.length ? true : false
    this.setState({ checked })
  }

  handleBtnClick = () => {
    const { name, idCardNumber, tempImageUrl1, tempImageUrl2, tempImageUrl3, checked, user } = this.state
    const openId = get('openid')
    if (name && idCardNumber && tempImageUrl1 && tempImageUrl2 && tempImageUrl3 && checked) {
      const orderId = parseInt(Date.now() * Math.random())
      const price = 0.01
      getPay({ orderId, price, openId }).then(res => {
        const { timeStamp, nonceStr, signType, paySign } = res.data
        const payPackage = res.data.package
        Taro.requestPayment({
          timeStamp,
          nonceStr,
          package: payPackage,
          signType,
          paySign
        }).then(res => {
          Taro.showLoading({
            title: '正在上传......',
            mask: true
          })

          let uploadList = [tempImageUrl1, tempImageUrl2, tempImageUrl3].map(path => {
            return Taro.uploadFile({
              url: 'https://xwuyou.com/api/upload',
              filePath: path,
              name: 'himg'
            })
          })

          Promise.all(uploadList).then(res => {
            let hunterReq = {
              openId,
              name,
              orderId,
              price,
              idCardNumber,
              wxName: user.userName,
              wxAvatar: user.userAvatar,
              idCardFrontImageUrl: res[0].data,
              idCardBackImageUrl: res[1].data,
              studentCardImageUrl: res[2].data
            }
            addHunter({ hunterReq }).then(res => {
              Taro.hideLoading()
              Taro.switchTab({
                url: '/pages/mePage/index'
              })
            })
            let service = {
              openId,
              title: '您的猎人审核已成功提交',
              content: '请您耐心等待，我们的工作人员会尽快进行审核。'
            }
            addService({ service })
          }).catch(err => {
            Taro.hideLoading()
          })
        }).catch(err => {
          Taro.showToast({
            title: '支付失败',
            icon: 'none',
            duration: 2000
          })
        })
      })
    }
  }

  handleCancelClick = () => {
    const { user } = this.state
    Taro.showModal({
      title: '你确定要注销猎人资格吗？',
      content: '注销后您只能重新申请猎人资格。',
      success: res => {
        if (res.confirm) {

          refundPay({ orderId: user.identity.orderId, price: user.deposit }).then(res => {
            if (res.data.status === 200) {
              user.isHunter = false
              user.hunterOrderCount = 0
              user.hunterLevel = {
                name: '黑铁猎人',
                exp: 0,
                levelUp: 20
              }
              user.pool = 0
              user.dayQuest = [
                {
                  date: getNowDay(),
                  order: [],
                  quest1: false,
                  quest2: false,
                  quest3: false
                }
              ]
              user.deposit = 0
              user.identity = {}
              updateUser({ user }).then(res => {
                Taro.switchTab({
                  url: '/pages/mePage/index'
                })
              })
            }
          })
        }
      }
    })
  }

  render() {
    const { name, idCardNumber, tempImageUrl1, tempImageUrl2, tempImageUrl3, checked, user } = this.state

    return (
      <View className='be__hunter'>
        <View className='be__hunter--title'>{user.isHunter ? '你好，猎人' : '申请猎人资格'}</View>
        <View className='be__hunter--info'>{user.isHunter ? '猎人每天完成任务会获得更多奖励' : '请按规则填写您的资料以提供审核'}</View>
        {
          user.isHunter ?
            <View>
              <View className='cancel'>注销猎人资格</View>
              <View className='desc'>发起注销猎人后，您将失去猎人资格，您的猎人数据将清空，奖金池也将清空。您无法再继续接单、完成任务并获得奖励。这是一项不可逆的操作，请您谨慎考虑。</View>
              <View
                className='cancel--btn'
                onClick={this.handleCancelClick}
              >注销猎人资格</View>
            </View>
            : <View>
              <View className='be__hunter--input-wrapper'>
                <Input
                  id="name"
                  value={name}
                  placeholder='输入您的真实姓名'
                  onInput={this.handleInputChange}
                />
              </View>
              <View className='be__hunter--input-wrapper'>
                <Input
                  id="idCardNumber"
                  value={idCardNumber}
                  placeholder='输入您的身份证号码'
                  type='number'
                  maxLength={18}
                  onInput={this.handleInputChange}
                />
              </View>
              <View
                id="image1"
                className='be__hunter--upload'
                onClick={this.handleImageChoose}
              >
                {
                  tempImageUrl1 === '' ? <View className='text'>点击此处上传您的身份证正面照片</View> :
                    <Image src={tempImageUrl1} className='image' />
                }
              </View>
              <View
                id="image2"
                className='be__hunter--upload'
                onClick={this.handleImageChoose}
              >
                {
                  tempImageUrl2 === '' ? <View className='text'>点击此处上传您的身份证反面照片</View> :
                    <Image src={tempImageUrl2} className='image' />
                }
              </View>
              <View
                id="image3"
                className='be__hunter--upload'
                onClick={this.handleImageChoose}
              >
                {
                  tempImageUrl3 === '' ? <View className='text'>点击此处上传您的学生证内容页照片</View> :
                    <Image src={tempImageUrl3} className='image' />
                }
              </View>
              <View className='check'>
                <CheckboxGroup onChange={this.handleCheckBoxChange}>
                  <Checkbox className='check--box' value={true} checked={checked}>勾选即同意 <Text className='check--auth' onClick={this.routeToAgreePage}>《无忧校园猎人协议》</Text></Checkbox>
                </CheckboxGroup>
              </View>
              <View
                className='be__hunter--btn'
                onClick={this.handleBtnClick}
              >缴纳押金并提交审核</View>
            </View>
        }
      </View>
    )
  }
}
