import Taro, { Component } from '@tarojs/taro'
import { View, Textarea, Input, Picker, Text } from '@tarojs/components'
import './index.scss'
import { get, set } from '../../lib/global'
import { getFullTime } from '../../lib/time'
import { getTypeInfo } from '../../lib/utils'

export class OrderNormalPage extends Component {

  state = {
    typeInfo: {},
    user: {},
    username: '',
    selector: ['指定地址', '就近目标'],
    selectorChecked: '指定地址',
    price: 0,
    totalPrice: 0,
    addressText: '',
    locateText: '',
    needText: '',
    date: '',
    time: '',
    ticket: {},
    pool: 0,
    checkUsername: false,
    checkAddress: false,
    checkNeed: false,
    checkLocate: false,
    checkPrice: false,
    checkPool: false
  }

  componentWillMount() {
    this.setState({ typeInfo: getTypeInfo(this.$router.params.type), user: get('user') })
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
      locateText,
      needText,
      selectorChecked,
      ticket,
      date,
      time,
      pool,
      totalPrice,
      user
    } = this.state

    const openid = get('openid')
    const order = {
      openId: openid,
      userName: username,
      type: typeInfo.type,
      typeText: typeInfo.type === 1 ? '大众类需求' : '影分身',
      rank: typeInfo.rank,
      phoneNumber: user.phoneNumber,
      addressText,
      locate: {
        type: selectorChecked,
        text: selectorChecked === '就近目标' ? '就近目标' : locateText
      },
      needText,
      price: totalPrice,
      ticket,
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
    if (!locateText && selectorChecked === '指定地址') {
      this.setState({ checkLocate: true })
    } else {
      this.setState({ checkLocate: false })
    }
    if (!needText) {
      this.setState({ checkNeed: true })
    } else {
      this.setState({ checkNeed: false })
    }
    if (isNaN(totalPrice) || totalPrice < 1 || totalPrice === '') {
      this.setState({ checkPrice: true })
    } else {
      this.setState({ checkPrice: false })
    }
    if (isNaN(pool) || pool < 0 || pool === '' || pool > (totalPrice / 10) || pool >= 50 || pool > totalPrice || pool > user.pool) {
      this.setState({ checkPool: true })
    } else {
      this.setState({ checkPool: false })
    }
    if (!isNaN(totalPrice) && totalPrice >= 1 && !!username && !!addressText && !!locateText && !!needText && pool >= 0 && pool <= totalPrice && pool <= 50 && pool <= (totalPrice / 10) && pool <= user.pool) {
      set('order', order)
      Taro.navigateTo({
        url: '/pages/orderDetailPage/index'
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
      checkUsername,
      checkAddress,
      checkNeed,
      checkLocate,
      checkPrice,
      user
    } = this.state

    return (
      <View className='ordertype'>
        <View className='top'>
          <View
            className='rank'
            style={{ background: typeInfo.rank ? '#72c9aa' : '#ff3b3b' }}
          >
            {typeInfo.rank ? '可参与排行' : '不可参与排行'}
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
            placeholder='如：帮拿快递，帮带饭等'
            cursor-spacing='100px'
          />
          {
            checkNeed && <View className='error-info'>请输您的需求</View>
          }
        </View>
        <View className='order--locate'>
          <View className='locate--top'>
            <View className='title'>目标地址</View>
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
          {
            selectorChecked === '指定地址' ? <Input
              id='locateText'
              className='input--locate'
              placeholder='填写目标地址'
              value={locateText}
              cursor-spacing='100px'
              onChange={this.handleInputChange}
            /> : null
          }
          {
            checkLocate && <View className='error-info'>请输入您的联系地址</View>
          }
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
              className='input' />
            <View className='info'>根据实际情况填写，可增加被猎人接取的概率</View>
          </View>
          {
            checkPrice && <View className='error-info'>大众类需求最低价格1元，并且小数不能超过3位</View>
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
            user.pool >= 0.1 ?
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
                <View className='info'>奖金池 {user.pool} 元，每次最高可折扣订单10%</View>
                <View className='info'>折扣金额不可超过订单金额，最高可折扣50元</View>
                {
                  checkPool && <View className='error-info'>请输入正确的折扣金额</View>
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