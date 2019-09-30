import Taro, { Component } from '@tarojs/taro'
import { View, Textarea, Input, Picker } from '@tarojs/components'
import './index.scss'
import { get, set } from '../../lib/global'
import { getFullTime } from '../../lib/time'
import { getTypeInfo } from '../../lib/utils'

export class OrderShadowPage extends Component {

  state = {
    typeInfo: {},
    user: {},
    username: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').userName : '',
    price: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').price : 0,
    totalPrice: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').price - Taro.getStorageSync('tempOrder').pool : 0,
    locateText: '',
    selector: ['不限', '男', '女'],
    selectorChecked: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').sexText : '不限',
    needText: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').needText : '',
    time: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').time : '',
    date: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').date : '',
    pool: Taro.getStorageSync('tempOrder') ? Taro.getStorageSync('tempOrder').pool : 0,
    checkUsername: false,
    checkNeed: false,
    checkPrice: false,
    checkTime: false,
    checkDate: false,
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
      needText,
      selectorChecked,
      totalPrice,
      date,
      time,
      pool,
      user
    } = this.state

    const openid = Taro.getStorageSync('openid')

    const order = {
      openId: openid,
      userName: username,
      userAvatar: user.userAvatar,
      type: typeInfo.type,
      typeText: typeInfo.type === 1 ? '大众类需求' : '影分身',
      rank: typeInfo.rank,
      phoneNumber: user.phoneNumber,
      sexText: selectorChecked,
      needText: needText.replace(/代课/g, '无忧课'),
      date,
      time,
      price: totalPrice,
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
    if (!needText) {
      this.setState({ checkNeed: true })
    } else {
      this.setState({ checkNeed: false })
    }
    if (!time) {
      this.setState({ checkTime: true })
    } else {
      this.setState({ checkTime: false })
    }
    if (!date) {
      this.setState({ checkDate: true })
    } else {
      this.setState({ checkDate: false })
    }
    if (isNaN(totalPrice) || totalPrice < 15 || totalPrice === '') {
      this.setState({ checkPrice: true })
    } else {
      this.setState({ checkPrice: false })
    }
    if (isNaN(pool) || pool < 0 || pool === '' || pool > (totalPrice / 10) || pool >= 50 || pool > totalPrice || pool > user.pool) {
      this.setState({ checkPool: true })
    } else {
      this.setState({ checkPool: false })
    }
    if (!isNaN(totalPrice) && totalPrice >= 15 && !!username && !!needText && pool >= 0 && pool <= totalPrice && pool <= 50 && pool <= (totalPrice / 10) && pool <= user.pool) {
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
      needText,
      date,
      time,
      checkUsername,
      checkNeed,
      checkPrice,
      checkTime,
      checkDate,
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
            <Image src={require('../../assets/image/ic_username.png')} className='icon' />
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
        <View className='order--info'>
          <View className='title'>填写你的需求</View>
          <Textarea
            className='content'
            id='needText'
            value={needText}
            onInput={this.handleInputChange}
            placeholder='如：想找人到东教304看看等。(如因需求信息有歧义或描述不清晰导致订单取消，发布方承担主要责任)'
            cursor-spacing='100px'
          />
          {
            checkNeed && <View className='error-info'>请输入您的需求</View>
          }
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
          <View className='locate--top m-t'>
            <View className='title'>日期</View>
            <Picker
              id='date'
              mode="date"
              value={date}
              onChange={this.handleInputChange}
            >
              <View className='right'>
                <View className='right--title'>{date != '' ? date : '请选择'}</View>
                <Image src={require('../../assets/image/ic_arrow.png')} className='arrow' />
              </View>
            </Picker>
          </View>
          {
            checkDate && <View className='error-info'>请选择日期</View>
          }
        </View>
        <View className='order--locate'>
          <View className='locate--top m-t'>
            <View className='title'>时间</View>
            <Picker
              id='time'
              mode="time"
              value={time}
              onChange={this.handleInputChange}
            >
              <View className='right'>
                <View className='right--title'>{time != '' ? time : '请选择'}</View>
                <Image src={require('../../assets/image/ic_arrow.png')} className='arrow' />
              </View>
            </Picker>
          </View>
          {
            checkTime && <View className='error-info'>请选择时间</View>
          }
        </View>
        <View className='order--locate'>
          <View className='local--bottom'>
            <View className='title'>
              预期费用
            </View>
            <Input
              id='price'
              onChange={this.handleInputChange}
              type='number'
              placeholder='请输入预期费用'
              value={price}
              maxLength='5'
              cursor-spacing='100px'
              className='input' />
            <View className='info'>根据实际情况填写，可增加被猎人接取的概率</View>
          </View>
          {
            checkPrice && <View className='error-info'>影分身类需求最低价格15元</View>
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
                  onChange={this.handleInputChange}
                  type='digit'
                  value={pool}
                  placeholder='请输入折扣金额'
                  cursor-spacing='100px'
                  maxLength='5'
                  className='input' />
                <View className='info'>奖金池 {user.pool.toFixed(2)} 元，每次最高可折扣订单10%</View>
                <View className='info'>折扣金额不可超过订单金额，最高可折扣50元</View>
                {
                  checkPool && <View className='error-info'>本次折扣最多{totalPrice * 0.1}元</View>
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