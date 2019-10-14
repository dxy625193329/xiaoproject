import Taro, { Component } from '@tarojs/taro'
import { View, Textarea, Input, Picker } from '@tarojs/components'
import './index.scss'
import { get, set } from '../../lib/global'
import { getFullTime } from '../../lib/time'
import { getTypeInfo } from '../../lib/utils'

export class OrderNormalPage extends Component {

  state = {
    typeInfo: {},
    user: {},
    username: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').userName : '',
    selector: ['不限', '男', '女'],
    selectorChecked: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').sexText : '不限',
    price: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').price : 0,
    totalPrice: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').price - Taro.getStorageSync('tempOrder').pool : 0,
    addressText: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').addressText : '',
    needText: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').needText : '',
    privateText: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').privateText : '',
    date: '',
    time: '',
    pool: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').pool : 0,
    checkUsername: false,
    checkAddress: false,
    checkNeed: false,
    checkPrice: false,
    checkPool: false,
    tempOrder: {}
  }

  componentWillMount() {
    this.setState({ typeInfo: getTypeInfo(this.$router.params.type), user: get('user'), tempOrder: Taro.getStorageSync('tempOrder') })
  }

  handleSelectorChange = e => {
    this.setState({ selectorChecked: this.state.selector[e.detail.value] })
  }

  handleInputChange = e => {
    if (e.target.id === 'price') {
      if (isNaN(e.target.value) || e.target.value === '') {
        this.setState({ totalPrice: 0, price: 0 })
        return
      } else {
        let value = e.target.value
        this.setState({ totalPrice: parseFloat(parseFloat(value).toFixed(2)) })
        return
      }
    }
    if (e.target.id === 'pool') {
      if (isNaN(e.target.value) || e.target.value === '') {
        this.setState({ pool: 0 })
        return
      } else {
        this.setState({ pool: parseFloat(parseFloat(e.target.value).toFixed(2)) })
        return
      }
    }
    this.setState({ [e.target.id]: e.target.value })
  }
  handleOrderConfirm = () => {
    const {
      typeInfo,
      username,
      addressText,
      needText,
      selectorChecked,
      privateText,
      date,
      time,
      pool,
      totalPrice,
      user,
    } = this.state

    const openid = Taro.getStorageSync('openid')
    const order = {
      openId: openid,
      userAvatar: user.userAvatar,
      wxName: user.userName,
      userName: username,
      type: typeInfo.type,
      typeText: typeInfo.type === 1 ? '大众类需求' : '影分身',
      rank: typeInfo.rank,
      phoneNumber: user.phoneNumber,
      addressText,
      sexText: selectorChecked,
      needText: needText.replace(/代课/g, '无忧课'),
      privateText,
      price: totalPrice,
      date,
      time,
      pool,
      orderStamp: Date.now(),
      orderId: parseInt(Date.now() * Math.random()),
      formatStamp: getFullTime(),
      status: 'waitpay',
      statusText: '订单等待付款',
      showAppraise: true,
    }
    if (!username) {
      this.setState({ checkUsername: true })
    } else {
      this.setState({ checkUsername: false })
    }
    if (!addressText) {
      this.setState({ checkAddress: true })
    } else {
      this.setState({ checkAddress: false })
    }
    if (!needText) {
      this.setState({ checkNeed: true })
    } else {
      this.setState({ checkNeed: false })
    }
    if (isNaN(totalPrice) || totalPrice < 2 || totalPrice === '') {
      this.setState({ checkPrice: true })
    } else {
      this.setState({ checkPrice: false })
    }
    if (isNaN(pool) || pool < 0 || pool === '' || pool > (totalPrice / 10) || pool >= 50 || pool > totalPrice || pool > user.pool) {
      this.setState({ checkPool: true })
    } else {
      this.setState({ checkPool: false })
    }
    if (!isNaN(totalPrice) && totalPrice >= 2 && !!username && !!addressText && !!needText && pool >= 0 && pool <= totalPrice && pool <= 50 && pool <= (totalPrice / 10) && pool <= user.pool) {
      set('order', order)
      Taro.navigateTo({
        url: '/pages/orderDetailPage/index?fromOrder=true'
      })
    }
  }

  render() {

    const {
      typeInfo,
      username,
      selector,
      selectorChecked,
      addressText,
      needText,
      privateText,
      checkUsername,
      checkAddress,
      checkNeed,
      checkPrice,
      checkPool,
      user,
      totalPrice
    } = this.state

    return (
      <View className='ordertype'>
        <View className='top'>
          <View
            className='rank'
            style={{ background: '#72c9aa' }}
          >
            可参与排行
          </View>
          <View className='name'>{typeInfo.title}</View>
          <View className='desc'>{typeInfo.desc}</View>
        </View>
        <View className='middle'>
          <View className='locate'>
            <Image
              src={require('../../assets/image/ic_username.png')}
              className='icon'
            />
            <Input
              id='username'
              className='input'
              value={username}
              onChange={this.handleInputChange}
              placeholder='请输入联系人姓名'
            />
          </View>
          {
            checkUsername && <View className='error-info'>请输入联系人姓名</View>
          }
        </View>
        <View className='middle' style={{ marginTop: '20rpx' }}>
          <View className='locate'>
            <Image
              src={require('../../assets/image/ic_order_locate.png')}
              className='icon'
            />
            <Input
              id='addressText'
              className='input'
              value={addressText}
              onChange={this.handleInputChange}
              placeholder='请输入联系地址'
              cursor-spacing='100px'
            />
          </View>
          {
            checkAddress && <View className='error-info'>请输入联系地址</View>
          }
        </View>
        <View className='order--info'>
          <View className='title'>填写你的需求</View>
          <Textarea
            className='content'
            id='needText'
            value={needText}
            onInput={this.handleInputChange}
            placeholder='如：代拿快递，代买饭等。(如因需求信息有歧义或描述不清晰导致订单取消，发布方承担主要责任)'
            cursor-spacing='100px'
          />
          {
            checkNeed && <View className='error-info'>请输您的需求</View>
          }
        </View>
        <View className='order--info'>
          <View className='title'>填写隐私信息</View>
          <Textarea
            className='content'
            id='privateText'
            value={privateText}
            onInput={this.handleInputChange}
            placeholder='如：快递单号、教室门牌号等'
            cursor-spacing='100px'
          />
        </View>
        <View className='order--locate'>
          <View className='locate--top'>
            <View className='title'>猎人性别要求</View>
            <Picker mode='selector' range={selector} onChange={this.handleSelectorChange}>
              <View className='right'>
                <View className='right--title'>{selectorChecked}</View>
                <Image
                  src={require('../../assets/image/ic_arrow.png')}
                  className='arrow'
                />
              </View>
            </Picker>
          </View>
        </View>
        <View className='order--locate'>
          <View className='local--bottom'>
            <View className='title'>
              预期费用
            </View>
            <Input
              id='price'
              onChange={this.handleInputChange}
              type='digit'
              placeholder='请输入预期费用'
              cursor-spacing='100px'
              maxLength='5'
              value={price}
              className='input' />
            <View className='info'>根据实际情况填写，可增加被猎人接取的概率</View>
          </View>
          {
            checkPrice && <View className='error-info'>大众类需求最低价格2元，并且小数不能超过3位</View>
          }
        </View>
        <View className='bottom'>
          <View className='bottom--item'>
            <View className='bottom--title'>费用</View>
            <View className='bottom--text'>
              <View className='singal'>¥</View>
              <View className='price'>{totalPrice}</View>
            </View>
          </View>
          {
            user.pool >= 0.2 ?
              <View className='local--bottom'>
                <View className='title'>
                  折扣
              </View>
                <Input
                  id='pool'
                  onInput={this.handleInputChange}
                  type='digit'
                  value={pool}
                  placeholder='请输入折扣金额'
                  cursor-spacing='100px'
                  maxLength='5'
                  className='input' />
                <View className='info'>奖金池 {user.pool.toFixed(2)} 元，每次最高可折扣订单10%</View>
                <View className='info'>折扣金额不可超过订单金额，最高可折扣50元</View>
                {
                  checkPool && <View className='error-info'>本次折扣最多{(totalPrice * 0.1).toFixed(1)}元，当前可用奖金池{user.pool}元</View>
                }
              </View>
              : <View className='bottom--item'>
                <View className='bottom--title'>折扣</View>
                <View className='bottom--text'>暂无折扣</View>
              </View>
          }
        </View>
        <View className='order--price' onClick={this.handleOrderConfirm}>
          <View style={{ flex: 1 }}></View>
          <View className='order--comfirm'>确认订单</View>
          <View className='right'>
            <View className='singal'>¥</View>
            <View className='price'>{totalPrice}</View>
          </View>
        </View>
      </View>
    )
  }
}