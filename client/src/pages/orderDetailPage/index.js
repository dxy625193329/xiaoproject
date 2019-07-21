import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button } from '@tarojs/components'
import './index.scss'
import { get } from '../../lib/global'
import { getNowDay } from '../../lib/time'
import { checkOrderStatus, calcLevel } from '../../lib/utils'
import { addOrder, updateUser, updateOrder, getUserByOpenId, delOrder, getPay, refundPay } from '../../api'

export class OrderDetailPage extends Component {

  state = {
    orderInfo: {},
    userInfo: {},
    statusInfo: {},
    savedOpenid: '',
    isHunter: false,
    animation: {},
    showMask: false,
    showAppraiseMask: false,
    wxPay: false,
    restPay: false,
    disabledRestPay: false
  }

  componentWillMount() {
    this.setState({
      orderInfo: get('order'),
      userInfo: get('user'),
      isHunter: get('user').isHunter,
      savedOpenid: get('openid'),
      statusInfo: checkOrderStatus(get('order').status)
    })
  }

  componentDidMount() {
    const { wallet } = this.state.userInfo
    const { price } = this.state.orderInfo
    if (wallet - price >= 0) {
      this.setState({ restPay: true })
    } else {
      this.setState({ wxPay: true, disabledRestPay: true })
    }
  }

  handleOrderCheck = () => {
    this.maskAnimation('show')
  }

  hideMask = () => {
    this.maskAnimation()
  }

  maskAnimation = (flag = 'hide') => {
    if (flag === 'show') {
      let animation = Taro.createAnimation({
        duration: 150,
        timingFunction: 'ease',
      })
      animation.translateY(300)
      animation.step()
      this.setState({
        animation: animation.export(),
        showMask: true
      })
      setTimeout(() => {
        animation.translateY(0)
        animation.step()
        this.setState({ animation: animation.export() })
      }, 50)
    } else {
      this.setState({ showMask: false })
    }
  }

  selectPayment = index => {
    if (index === 1 && !this.state.disabledRestPay) {
      this.setState({ restPay: true, wxPay: false })
    } else {
      this.setState({ restPay: false, wxPay: true })
    }
  }

  handleOrderPay = () => {
    let order = { ...this.state.orderInfo }
    let user = { ...this.state.userInfo }
    if (this.state.restPay) {
      let { wallet } = user
      if (order.pool > 0) {
        wallet = wallet - (order.price - order.pool)
        wallet = parseFloat(wallet.toFixed(2))
        user.pool -= order.pool
        user.pool = parseFloat((user.pool).toFixed(2))
      } else {
        wallet -= order.price
        wallet = parseFloat(wallet.toFixed(2))
      }
      order.pay = 'rest'
      order.statusText = '订单等待接单'
      order.status = 'wait'
      addOrder({ order })
      user.wallet = wallet
      user.userOrder.push(order)
      updateUser({ user }).then(res => {
        Taro.switchTab({
          url: '/pages/orderPage/index'
        })
      })
    } else {
      let nowPrice
      if (order.pool > 0) {
        nowPrice = order.price - order.pool
        nowPrice = parseFloat(nowPrice.toFixed(2))
        user.pool -= order.pool
        user.pool = parseFloat((order.pool).toFixed(2))
      } else {
        nowPrice = order.price
        nowPrice = parseFloat(nowPrice.toFixed(2))
      }
      getPay({ orderId: order.orderId, price: nowPrice, openId: user.openId }).then(res => {
        const { timeStamp, nonceStr, signType, paySign } = res.data
        const payPackage = res.data.package
        Taro.requestPayment({
          timeStamp,
          nonceStr,
          package: payPackage,
          signType,
          paySign
        }).then(res => {
          order.pay = 'wx'
          order.statusText = '订单等待接单'
          order.status = 'wait'
          addOrder({ order })
          user.userOrder.push(order)
          updateUser({ user }).then(res => {
            Taro.switchTab({
              url: '/pages/orderPage/index'
            })
          })
        }).catch(err => {
          console.log(err)
        })
      })
    }
  }

  handleCancelOrder = () => {
    Taro.showModal({
      title: '确定取消订单？',
      success: res => {
        if (res.confirm) {
          let order = { ...this.state.orderInfo }
          let user = { ...this.state.userInfo }
          if (order.pay === 'rest') {
            if (order.pool > 0) {
              user.wallet += (order.price - order.pool)
              user.wallet = parseFloat((user.wallet).toFixed(2))
              user.pool += order.pool
              user.pool = parseFloat((user.pool).toFixed(2))
            } else {
              user.wallet += order.price
              user.wallet = parseFloat((user.wallet).toFixed(2))
            }
            user.userOrder.map((item, index) => {
              if (item.orderId === order.orderId) {
                user.userOrder.splice(index, 1)
              }
            })
            updateUser({ user }).then(res => {
              console.log('订单的用户orderList更新成功')
            })
            delOrder({ orderId: order.orderId }).then(res => {
              Taro.switchTab({
                url: '/pages/orderPage/index'
              })
              Taro.showToast({
                title: '订单取消成功',
                icon: 'success',
                duration: 2000
              })
            })
          } else {
            let price = 0
            if (order.pool > 0) {
              price = order.price - order.pool
              price = parseFloat(price.toFixed(2))
            } else {
              price = order.price
              price = parseFloat(price.toFixed(2))
            }
            refundPay({ orderId: order.orderId, price }).then(res => {
              if (res.data.status === 200) {
                user.userOrder.map((item, index) => {
                  if (item.orderId === order.orderId) {
                    user.pool += order.pool
                    user.pool = parseFloat((user.pool).toFixed(2))
                    user.userOrder.splice(index, 1)
                  }
                })
                updateUser({ user }).then(res => {
                  console.log('订单的用户orderList更新成功')
                })
                delOrder({ orderId: order.orderId }).then(res => {
                  Taro.switchTab({
                    url: '/pages/orderPage/index'
                  })
                  Taro.showToast({
                    title: '订单取消成功',
                    icon: 'success',
                    duration: 2000
                  })
                })
              }
            })
          }
        }
      }
    })
  }

  handleOrderHunt = () => {
    let order = { ...this.state.orderInfo }
    let user = { ...this.state.userInfo }
    order.statusText = '订单进行中'
    order.status = 'process'
    order.hunter = {
      name: user.userName,
      openId: user.openId,
      avatar: user.userAvatar,
      level: user.hunterLevel.name,
      count: user.hunterOrderCount,
      phoneNumber: user.phoneNumber
    }
    updateOrder({ order }).then(res => {
      console.log('订单信息修改成功')
    })
    getUserByOpenId({ openId: order.openId }).then(res => {
      let { user } = res.data.data
      for (let i = 0; i < user.userOrder.length; i++) {
        if (user.userOrder[i].orderId === order.orderId) {
          user.userOrder[i] = order
        }
      }
      updateUser({ user }).then(res => {
        console.log('订单的用户orderList更新成功')
      })
    })
    user.hunterOrder.push(order)
    updateUser({ user }).then(res => {
      Taro.switchTab({
        url: '/pages/orderPage/index'
      })
    })
  }

  handleOrderComplete = () => {
    let order = { ...this.state.orderInfo }
    order.statusText = '订单等待确认完成'
    order.status = 'confirm'
    updateOrder({ order }).then(res => {
      console.log('订单信息修改成功')
    })
    getUserByOpenId({ openId: order.openId }).then(res => {
      let { user } = res.data.data
      for (let i = 0; i < user.userOrder.length; i++) {
        if (user.userOrder[i].orderId === order.orderId) {
          user.userOrder[i] = order
        }
      }
      updateUser({ user }).then(res => {
        console.log('订单的用户orderList更新成功')
      })
    })
    getUserByOpenId({ openId: order.hunter.openId }).then(res => {
      let { user } = res.data.data
      for (let i = 0; i < user.hunterOrder.length; i++) {
        if (user.hunterOrder[i].orderId === order.orderId) {
          user.hunterOrder[i] = order
        }
      }
      updateUser({ user }).then(res => {
        console.log('订单的猎人hunterList更新成功')
        Taro.switchTab({
          url: '/pages/orderPage/index'
        })
      })
    })
  }

  handleConfirmOrder = () => {
    let order = { ...this.state.orderInfo }
    order.statusText = '订单已完成'
    order.status = 'complete'
    updateOrder({ order }).then(res => {
      console.log('订单信息修改成功')
    })
    getUserByOpenId({ openId: order.openId }).then(res => {
      let { user } = res.data.data
      for (let i = 0; i < user.userOrder.length; i++) {
        if (user.userOrder[i].orderId === order.orderId) {
          user.userOrder[i] = order
        }
      }
      user.userOrderCount += 1
      user.userLevel.exp += 1
      let levelObj = calcLevel(2, user.userOrderCount, user.userLevel)
      user.userLevel = levelObj
      updateUser({ user }).then(res => {
        console.log('订单的用户orderList更新成功')
      })
    })
    getUserByOpenId({ openId: order.hunter.openId }).then(res => {
      let { user } = res.data.data
      for (let i = 0; i < user.hunterOrder.length; i++) {
        if (user.hunterOrder[i].orderId === order.orderId) {
          user.hunterOrder[i] = order
        }
      }
      user.wallet += (order.price) * 0.9
      user.pool += (order.price) * 0.1
      user.hunterOrderCount += 1
      user.hunterLevel.exp += 1
      let levelObj = calcLevel(1, user.hunterOrderCount, user.hunterLevel)
      user.hunterLevel = levelObj
      let dayQuest = user.dayQuest
      for (let i = 0; i < dayQuest.length; i++) {
        if (dayQuest[i].date === getNowDay()) {
          dayQuest[i].order.push(order)
        }
      }
      user.dayQuest = dayQuest
      updateUser({ user }).then(res => {
        console.log('订单的猎人hunterList更新成功')
        Taro.switchTab({
          url: '/pages/orderPage/index'
        })
      })
    })
  }

  makePhoneCall = () => {
    const { phoneNumber } = this.state.orderInfo.hunter
    Taro.makePhoneCall({
      phoneNumber
    })
  }

  makeUserPhoneCall = () => {
    const { phoneNumber } = this.state.orderInfo
    Taro.makePhoneCall({
      phoneNumber
    })
  }

  preventTouchMove = () => { }

  render() {
    const {
      openId,
      userName,
      locate,
      type,
      needText,
      price,
      orderId,
      formatStamp,
      addressText,
      hunter,
      date,
      time,
      status,
      pool,
      showAppraise,
      pay,
      phoneNumber
    } = this.state.orderInfo
    const { wallet } = this.state.userInfo
    const {
      statusInfo,
      savedOpenid,
      animation,
      showMask,
      restPay,
      wxPay,
      disabledRestPay,
      showAppraiseMask,
      isHunter
    } = this.state

    return (
      <View className='orderconfirm'>
        {
          showMask ?
            <View catchtouchmove={this.preventTouchMove}>
              <View className='mask' onClick={this.hideMask}></View>
              <View animation={animation} className='mask--wrapper'>
                <View className='mask--content'>
                  <View className='title'>选择支付方式</View>
                  <View className='pay'>
                    <View
                      className={['item', disabledRestPay ? 'pay--disabled' : null, restPay ? 'payment' : null]}
                      onClick={() => this.selectPayment(1)}
                    >
                      <View className='left'>
                        <Image
                          src={require('../../assets/image/ic_rest_pay.png')}
                          className='icon'
                        />
                        <View>余额支付</View>
                      </View>
                      <View className='right'>¥ {wallet}</View>
                    </View>
                    <View
                      className={['item', wxPay ? 'payment' : null]}
                      onClick={() => this.selectPayment(2)}
                    >
                      <View className='left'>
                        <Image
                          src={require('../../assets/image/ic_weixin_pay.png')}
                          className='icon'
                        />
                        <View>微信支付</View>
                      </View>
                    </View>
                  </View>
                  <View className='check' onClick={this.handleOrderPay}>支付</View>
                </View>
              </View>
            </View>
            : null
        }
        <View className='top'>
          <View></View>
          <View className='name'>{statusInfo.title}</View>
          <View className='desc'>{statusInfo.text}</View>
        </View>
        {
          hunter !== {} && hunter !== undefined ?
            <View className='hunter mg-t'>
              <View className='hunter-top'>
                <View className='left'>
                  <Image src={hunter.avatar} className='avatar' />
                  <View className='info'>
                    <View className='name'>{hunter.name}</View>
                    <View className='level'>{hunter.level}</View>
                  </View>
                </View>
                <View className='right'>
                  <View className='count'>{hunter.count}</View>
                  <View className='desc'>已完成订单</View>
                </View>
                <Button
                  className='phone'
                  onClick={this.makePhoneCall}
                ></Button>
              </View>
            </View> : null
        }
        <View className={['middle', hunter === {} || hunter === undefined ? 'mg-t' : null]}>
          <View className='title'>用户信息</View>
          <View className='info--type'>
            <View className='info--title'>联系人</View>
            <View className='info--text'>{userName}</View>
          </View>
          {
            type === 1 ?
              <View className='info--desc'>
                <View className='title'>联系地址</View>
                <View className='text'>{addressText}</View>
              </View> : null
          }
          {
            ['waitpay', 'process', 'confirm', 'complete'].includes(status) &&
            <View className='info--desc'>
              <View className='title'>联系电话</View>
              <View className='text' onClick={this.makeUserPhoneCall}>{phoneNumber}</View>
            </View>
          }

        </View>
        <View className='order--info'>
          <View className='title'>需求信息</View>
          <View className='info--type'>
            <View className='info--title'>需求类别</View>
            <View className='info--text'>{type === 1 ? '大众类需求' : '影分身'}</View>
          </View>
          <View className='info--desc'>
            <View className='title'>需求信息</View>
            <View className='text'>{needText}</View>
          </View>
          <View className='info--desc'>
            <View className='title'>目标地址</View>
            <View className='text'>{locate.text}</View>
          </View>
          {
            date != '' ?
              <View className='info--desc'>
                <View className='title'>日期</View>
                <View className='text'>{date}</View>
              </View> : null
          }
          {
            time != '' ?
              <View className='info--desc'>
                <View className='title'>时间</View>
                <View className='text'>{time}</View>
              </View> : null
          }
        </View>
        <View className='bottom'>
          <View className='title'>费用信息</View>
          <View className='bottom--item'>
            <View className='bottom--title'>费用</View>
            <View className='bottom--text'>
              <View className='singal'>¥</View>
              <View className='price'>{price}</View>
            </View>
          </View>
          {
            pool > 0 ?
              <View className='bottom--item'>
                <View className='bottom--title'>折扣</View>
                <View className='bottom--text'>
                  <View className='singal'>- ¥</View>
                  <View className='price'>{pool}</View>
                </View>
              </View> :
              <View className='bottom--item'>
                <View className='bottom--title'>折扣</View>
                <View className='bottom--text'>暂无折扣</View>
              </View>
          }
          {
            pool > 0 ?
              <View className='bottom--item'>
                <View className='bottom--title'>总计</View>
                <View className='bottom--text'>
                  <View className='singal'>¥</View>
                  <View className='price'>{price - pool}</View>
                </View>
              </View> :
              <View className='bottom--item'>
                <View className='bottom--title'>总计</View>
                <View className='bottom--text'>
                  <View className='singal'>¥</View>
                  <View className='price'>{price}</View>
                </View>
              </View>
          }
        </View>
        <View className='bottom mg-b'>
          <View className='title'>其他信息</View>
          <View className='bottom--item'>
            <View className='bottom--title'>订单号</View>
            <View className='bottom--text'>{orderId} </View>
          </View>
          <View className='bottom--item'>
            <View className='bottom--title'>订单时间</View>
            <View className='bottom--text'>{formatStamp}</View>
          </View>
          {
            pay ? <View className='bottom--item'>
              <View className='bottom--title'>支付方式</View>
              <View className='bottom--text'>{pay === 'rest' ? '余额支付' : '微信支付'}</View>
            </View> : null
          }
        </View>
        {
          status === 'waitpay' && openId === savedOpenid ?
            <View className='order--price' onClick={this.handleOrderCheck}>
              <View style={{ flex: 1 }}></View>
              <View className='order--comfirm'>立即支付</View>
              <View className='right'>
                <View className='singal'>¥</View>
                <View className='price'>{price - pool}</View>
              </View>
            </View> : null
        }
        {
          status === 'wait' && openId === savedOpenid ?
            <View className='order--price' onClick={this.handleCancelOrder}>
              <View style={{ flex: 1 }}></View>
              <View className='order--comfirm'>取消订单</View>
              <View style={{ flex: 1 }}></View>
            </View> : null
        }
        {
          status === 'confirm' && openId === savedOpenid ?
            <View className='order--price' onClick={this.handleConfirmOrder}>
              <View style={{ flex: 1 }}></View>
              <View className='order--comfirm'>确认完成</View>
              <View style={{ flex: 1 }}></View>
            </View> : null
        }
        {
          status === 'wait' && openId !== savedOpenid && isHunter ?
            <View className='order--price' onClick={this.handleOrderHunt}>
              <View style={{ flex: 1 }}></View>
              <View className='order--comfirm'>立即抢单</View>
              <View style={{ flex: 1 }}></View>
            </View> : null
        }
        {
          status === 'process' && openId !== savedOpenid && isHunter && hunter.openId === savedOpenid ?
            <View className='order--price' onClick={this.handleOrderComplete}>
              <View style={{ flex: 1 }}></View>
              <View className='order--comfirm'>完成订单</View>
              <View style={{ flex: 1 }}></View>
            </View> : null
        }
      </View>
    )
  }
}