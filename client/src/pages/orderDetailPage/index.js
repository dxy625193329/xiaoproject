import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button, Form } from '@tarojs/components'
import './index.scss'
import { get, set } from '../../lib/global'
import { getNowDay } from '../../lib/time'
import { checkOrderStatus, toast } from '../../lib/utils'
import {
  updateUser,
  delOrder,
  getPay,
  refundPay,
  createOrder,
  cancelOrder,
  hunterGetOrder,
  hunterCompleteOrder,
  userConfirmOrder
} from '../../api'

export class OrderDetailPage extends Component {

  state = {
    orderInfo: {},
    userInfo: {},
    statusInfo: {},
    savedOpenid: '',
    isHunter: false,
    animation: {},
    showMask: false,
    showDontTouch: false,
    showAppraiseMask: false,
    wxPay: false,
    restPay: false,
    disabledRestPay: false,
    message: []
  }

  componentWillMount() {
    this.setState({
      orderInfo: get('order'),
      userInfo: get('user'),
      isHunter: get('user').isHunter,
      savedOpenid: get('openid'),
      statusInfo: checkOrderStatus(get('order').status),
      message: Taro.getStorageSync('message') || []
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

  handleOrderCheck = (e) => {
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
    const order = { ...this.state.orderInfo }
    const user = { ...this.state.userInfo }
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
      user.wallet = wallet
      createOrder({ order, user: { openId: user.openId, wallet: user.wallet, pool: user.pool } }).then(res => {
        if (res.data.code === 200) {
          set('user', user)
          this.setState({ showMask: false, showDontTouch: true })
          toast('发单成功', 'success')
          setTimeout(() => {
            Taro.switchTab({
              url: '/pages/orderPage/index'
            })
          }, 1000)
        } else {
          toast('创建订单失败，请检查您的网络状态后重试', 'none')
        }
      }).catch(err => {
        toast('创建订单失败，请检查您的网络状态后重试', 'none')
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
          createOrder({ order, user: { openId: user.openId, wallet: user.wallet, pool: user.pool } }).then(res => {
            if (res.data.code === 200) {
              this.setState({ showMask: false, showDontTouch: true })
              toast('发单成功', 'success')
              setTimeout(() => {
                Taro.switchTab({
                  url: '/pages/orderPage/index'
                })
              }, 1000)
            } else {
              toast('创建订单失败，请检查您的网络状态后重试', 'none')
            }
          }).catch(err => {
            toast('创建订单失败，请检查您的网络状态后重试', 'none')
          })
        }).catch(err => {
          toast('支付失败或取消支付，请重试', 'none')
        })
      }).catch(err => {
        toast('支付失败，请检查您的网络环境后重试', 'none')
      })
    }
  }

  handleCancelOrder = () => {
    Taro.showModal({
      title: '确定取消订单？',
      success: res => {
        if (res.confirm) {
          const order = { ...this.state.orderInfo }
          const user = { ...this.state.userInfo }
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
            cancelOrder({ user: { openId: user.openId, wallet: user.wallet, pool: user.pool }, orderId: order.orderId }).then(res => {
              if (res.data.code === 200) {
                set('user', user)
                this.setState({ showDontTouch: true })
                toast('订单取消成功', 'success')
                setTimeout(() => {
                  Taro.switchTab({
                    url: '/pages/orderPage/index'
                  })
                }, 1000)
              } else {
                toast('订单取消失败，请检查您的网络状态后重试', 'none')
              }
            }).catch(err => {
              toast('订单取消失败，请检查您的网络状态后重试', 'none')
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
                delOrder({ orderId: order.orderId }).then(res => {
                  if (res.data.code == 200) {
                    this.setState({ showDontTouch: true })
                    toast('订单取消成功', 'success')
                    setTimeout(() => {
                      Taro.switchTab({
                        url: '/pages/orderPage/index'
                      })
                    }, 1000)
                  } else {
                    toast('订单取消失败，请检查您的网络状态后重试', 'none')
                  }
                })
              } else {
                toast('订单取消失败，请检查您的网络状态后重试', 'none')
              }
            })
          }
        }
      }
    })
  }

  handleOrderHunt = () => {
    const order = { ...this.state.orderInfo }
    const user = { ...this.state.userInfo }
    order.statusText = '订单进行中'
    order.status = 'process'
    order.hunterOpenId = user.openId
    order.hunter = {
      name: user.userName,
      openId: user.openId,
      avatar: user.userAvatar,
      level: user.hunterLevel.name,
      count: user.hunterOrderCount,
      phoneNumber: user.phoneNumber
    }
    hunterGetOrder({ order: { id: order.orderId, statusText: order.statusText, status: order.status, hunterOpenId: order.hunterOpenId, hunter: order.hunter } }).then(res => {
      if (res.data.code === 200) {
        this.setState({ showMask: false, showDontTouch: true })
        toast('接单成功', 'success')
        setTimeout(() => {
          Taro.switchTab({
            url: '/pages/orderPage/index'
          })
        }, 1000)
      } else {
        toast('接单失败，请检查您的网络状态后重试', 'none')
      }
    }).catch(err => {
      toast('接单失败，请检查您的网络状态后重试', 'none')
    })
  }

  handleOrderComplete = () => {
    const order = { ...this.state.orderInfo }
    order.statusText = '订单等待确认完成'
    order.status = 'confirm'
    hunterCompleteOrder({ order: { id: order.orderId, statusText: order.statusText, status: order.status } }).then(res => {
      if (res.data.code === 200) {
        this.setState({ showDontTouch: true })
        toast('完成订单成功', 'success')
        setTimeout(() => {
          Taro.switchTab({
            url: '/pages/orderPage/index'
          })
        }, 1000)
      } else {
        toast('完成订单失败，请检查您的网络状态后重试', 'none')
      }
    }).catch(err => {
      toast('完成订单失败，请检查您的网络状态后重试', 'none')
    })
  }

  handleConfirmOrder = () => {
    const order = { ...this.state.orderInfo }
    order.statusText = '订单已完成'
    order.status = 'complete'
    userConfirmOrder({ order: { id: order.orderId, statusText: order.statusText, status: order.status, price: order.price }, nowTime: getNowDay() }).then(res => {
      if (res.data.code === 200) {
        this.setState({ showDontTouch: true })
        toast('确认订单成功', 'success')
        setTimeout(() => {
          Taro.switchTab({
            url: '/pages/orderPage/index'
          })
        }, 1000)
      } else {
        toast('确认订单失败，请检查您的网络状态后重试', 'none')
      }
    }).catch(err => {
      toast('确认订单失败，请检查您的网络状态后重试', 'none')
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

  makeMessageToHunter = () => {
    if (this.state.orderInfo.hunterOpenId === this.state.savedOpenid) {
      toast('无法给自己留言', 'none')
    } else {
      if (this.state.message.includes(this.state.orderInfo.hunterOpenId) || this.state.message.includes(this.state.orderInfo.openId)) {
        Taro.navigateTo({
          url: '/pages/imListPage/index'
        })
      } else {
        set('messageItem', {
          toName: this.state.orderInfo.hunter.name,
          toId: this.state.orderInfo.hunterOpenId,
          fromName: this.state.userInfo.userName,
          fromId: this.state.savedOpenid,
          fromAvatar: this.state.orderInfo.userAvatar,
          toAvatar: this.state.orderInfo.hunter.avatar,
          hunterId: this.state.orderInfo.hunterOpenId,
          byId: this.state.savedOpenid
        })
        Taro.navigateTo({
          url: '/pages/messagePage/index'
        })
      }
    }
  }

  makeMessageToUser = () => {
    if (this.state.orderInfo.openId === this.state.savedOpenid) {
      toast('无法给自己留言', 'none')
    } else {
      console.log(this.state.message.includes(this.state.orderInfo.hunterOpenId) || this.state.message.includes(this.state.orderInfo.openId))
      if (this.state.message.includes(this.state.orderInfo.hunterOpenId) || this.state.message.includes(this.state.orderInfo.openId)) {
        Taro.navigateTo({
          url: '/pages/imListPage/index'
        })
      } else {
        set('messageItem', {
          toName: this.state.orderInfo.wxName,
          toId: this.state.orderInfo.openId,
          fromName: this.state.userInfo.userName,
          fromId: this.state.savedOpenid,
          fromAvatar: this.state.userInfo.userAvatar,
          toAvatar: this.state.orderInfo.userAvatar,
          hunterId: this.state.orderInfo.hunterOpenId,
          byId: this.state.savedOpenid
        })
        Taro.navigateTo({
          url: '/pages/messagePage/index'
        })
      }
    }
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
      pay,
      hunterOpenId
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
      isHunter
    } = this.state

    return (
      <View className='orderconfirm'>
        {
          showDontTouch && <View className='mask' catchtouchmove={this.preventTouchMove}></View>
        }
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
              </View>
              <View className='hunter-bottom'>
                <View className='bottom-item'>
                  <Button
                    className='phone'
                    onClick={this.makePhoneCall}
                  ></Button>
                  <View className='desc'>电话联系</View>
                </View>
                <View className='bottom-item'>
                  <Button
                    className='message'
                    onClick={this.makeMessageToHunter}
                  ></Button>
                  <View className='desc'>留言</View>
                </View>
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
            ['process', 'confirm', 'complete'].includes(status) &&
            <View className='info--desc'>
              <View className='title'>联系方式</View>
              <View className='contact'>
                <View className='item'>
                  <Button
                    className='phone'
                    onClick={this.makeUserPhoneCall}
                  ></Button>
                  <View className='desc'>电话联系</View>
                </View>
                <View className='item'>
                  <Button
                    className='message'
                    onClick={this.makeMessageToUser}
                  ></Button>
                  <View className='desc'>留言</View>
                </View>
              </View>
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
            <Form reportSubmit onSubmit={this.handleOrderCheck}>
              <Button className='order--price' formType='submit'>
                <View style={{ flex: 1 }}></View>
                <View className='order--comfirm'>立即支付</View>
                <View className='right'>
                  <View className='singal'>¥</View>
                  <View className='price'>{price - pool}</View>
                </View>
              </Button>
            </Form>
            : null
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
          status === 'process' && openId !== savedOpenid && isHunter && hunterOpenId === savedOpenid ?
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