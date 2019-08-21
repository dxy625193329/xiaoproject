import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button, Form } from '@tarojs/components'
import './index.scss'
import { get, set } from '../../lib/global'
import { getNowDay, getOverTime } from '../../lib/time'
import { checkOrderStatus, toast } from '../../lib/utils'
import {
  createOrder,
  cancelOrder,
  cancelOrderForVoucher,
  hunterGetOrder,
  hunterCompleteOrder,
  userConfirmOrder,
  getMessageList,
  hunterCancelOrder
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
    voucherPay: true,
    restPay: false,
    message: []
  }

  componentWillMount() {
    this.setState({
      orderInfo: get('order'),
      userInfo: get('user'),
      isHunter: get('isHunter'),
      savedOpenid: get('openid'),
      statusInfo: checkOrderStatus(get('order').status),
    })
  }

  componentDidShow() {
    getMessageList({ openId: this.state.savedOpenid }).then(res => {
      if (res.data.code === 200) {
        const { messageList } = res.data
        this.setState({ message: messageList })
      }
    })
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
    if (index === 1) {
      this.setState({ voucherPay: true, restPay: false })
    } else {
      this.setState({ voucherPay: false, restPay: true })
    }
  }

  handleOrderPay = () => {
    const order = { ...this.state.orderInfo }
    const user = { ...this.state.userInfo }
    if (this.state.voucherPay) {
      if (user.voucher - order.price >= 0) {
        let { voucher } = user
        if (order.pool > 0) {
          voucher = voucher - (order.price - order.pool)
          voucher = parseFloat(voucher.toFixed(2))
          user.pool -= order.pool
          user.pool = parseFloat((user.pool).toFixed(2))
        } else {
          voucher -= order.price
          voucher = parseFloat(voucher.toFixed(2))
        }
        order.pay = 'voucher'
        order.statusText = '订单等待接单'
        order.status = 'wait'
        user.voucher = voucher
        createOrder({ order, user: { openId: user.openId, voucher: user.voucher, pool: user.pool } }).then(res => {
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
            toast('创建订单失败，请检查您的网络状态后重试')
          }
        }).catch(err => {
          toast('创建订单失败，请检查您的网络状态后重试')
        })
      } else {
        toast('代金不足，请选择其他支付方式')
      }
    }
    if (this.state.restPay) {
      if (user.wallet - order.price >= 0) {
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
        toast('余额不足，请前往钱包充值')
      }
    }
  }

  cancelOrderFunc = (formId = '') => {
    const order = { ...this.state.orderInfo }
    const user = { ...this.state.userInfo }
    let data = {}
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
      if (formId) {
        data = {
          user: { openId: user.openId, wallet: user.wallet, pool: user.pool }, orderId: order.orderId, formId, hunterOpenId: order.hunterOpenId
        }
      } else {
        data = {
          user: { openId: user.openId, wallet: user.wallet, pool: user.pool }, orderId: order.orderId
        }
      }
      cancelOrder(data).then(res => {
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
          toast('订单取消失败，请检查您的网络状态后重试')
        }
      }).catch(err => {
        toast('订单取消失败，请检查您的网络状态后重试')
      })
    } else {
      if (order.pool > 0) {
        user.voucher += (order.price - order.pool)
        user.voucher = parseFloat((user.voucher).toFixed(2))
        user.pool += order.pool
        user.pool = parseFloat((user.pool).toFixed(2))
      } else {
        user.voucher += order.price
        user.voucher = parseFloat((user.voucher).toFixed(2))
      }
      if (formId) {
        data = {
          user: { openId: user.openId, voucher: user.voucher, pool: user.pool }, orderId: order.orderId, formId, hunterOpenId: order.hunterOpenId
        }
      } else {
        data = {
          user: { openId: user.openId, voucher: user.voucher, pool: user.pool }, orderId: order.orderId
        }
      }
      cancelOrderForVoucher(data).then(res => {
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
          toast('订单取消失败，请检查您的网络状态后重试')
        }
      }).catch(err => {
        toast('订单取消失败，请检查您的网络状态后重试')
      })
    }
  }

  handleCancelOrder = () => {
    Taro.showModal({
      title: '确定取消订单？',
      success: res => {
        if (res.confirm) {
          this.cancelOrderFunc()
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
      phoneNumber: user.phoneNumber,
      getTime: Date.now()
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
        toast('接单失败，请检查您的网络状态后重试')
      }
    }).catch(err => {
      toast('接单失败，请检查您的网络状态后重试')
    })
  }

  handleOrderComplete = () => {
    const overTime = parseInt(this.state.orderInfo.hunter.getTime / 1000) + 5 * 60
    const isOverTime = Date.now() / 1000 - overTime > 0
    if (isOverTime) {
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
          toast('完成订单失败，请检查您的网络状态后重试')
        }
      }).catch(err => {
        toast('完成订单失败，请检查您的网络状态后重试')
      })
    } else {
      toast('5分钟保护期后您才可以完成订单。')
    }
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
        toast('确认订单失败，请检查您的网络状态后重试')
      }
    }).catch(err => {
      toast('确认订单失败，请检查您的网络状态后重试')
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
      toast('无法给自己留言')
    } else {
      const { message } = this.state
      const messageItemList = message.filter(item => {
        return (item.byId === this.state.orderInfo.openId && item.toId === this.state.orderInfo.hunterOpenId) || item.byId === this.state.orderInfo.hunterOpenId && item.toId === this.state.orderInfo.openId
      })
      if (messageItemList.length > 0) {
        set('messageItem', messageItemList[0])
        Taro.navigateTo({
          url: '/pages/messagePage/index'
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
      toast('无法给自己留言')
    } else {
      const { message } = this.state
      const messageItemList = message.filter(item => {
        return (item.byId === this.state.orderInfo.openId && item.toId === this.state.orderInfo.hunterOpenId) || item.byId === this.state.orderInfo.hunterOpenId && item.toId === this.state.orderInfo.openId
      })
      if (messageItemList.length > 0) {
        set('messageItem', messageItemList[0])
        Taro.navigateTo({
          url: '/pages/messagePage/index'
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

  cancelProcessOrder = e => {
    Taro.showModal({
      title: '您正在取消订单',
      content: '确定取消订单吗？',
      success: res => {
        if (res.confirm) {
          this.cancelOrderFunc(e.detail.formId)
        }
      },
    })
  }

  handleHunterCancel = e => {
    const overTime = parseInt(this.state.orderInfo.hunter.getTime / 1000) + 5 * 60
    const isOverTime = Date.now() / 1000 - overTime > 0
    const order = { ...this.state.orderInfo }
    const formId = e.detail.formId
    if (isOverTime) {
      Taro.showModal({
        title: '您正在取消订单',
        content: '此时取消订单您将从您的猎人保证金中扣除2元作为惩罚，请您谨慎操作。',
        success: res => {
          if (res.confirm) {
            order.statusText = '订单等待接单'
            order.status = 'wait'
            hunterCancelOrder({ order: { id: order.orderId, statusText: order.statusText, status: order.status, hunterOpenId: order.hunterOpenId, price: order.price, userName: order.userName, openId: order.openId }, formId, flag: 2 }).then(res => {
              if (res.data.code === 200) {
                this.setState({ showMask: false, showDontTouch: true })
                toast('取消订单成功', 'success')
                setTimeout(() => {
                  Taro.switchTab({
                    url: '/pages/orderPage/index'
                  })
                }, 1000)
              } else {
                toast('取消订单失败，请检查您的网络状态后重试')
              }
            }).catch(err => {
              toast('取消订单失败，请检查您的网络状态后重试')
            })
          }
        },
      })
    } else {
      Taro.showModal({
        title: '您正在取消订单',
        content: '确定取消订单吗？',
        success: res => {
          if (res.confirm) {
            order.statusText = '订单等待接单'
            order.status = 'wait'
            hunterCancelOrder({ order: { id: order.orderId, statusText: order.statusText, status: order.status, hunterOpenid: order.hunterOpenId, price: order.price, userName: order.userName, openId: order.openId }, formId, flag: 1 }).then(res => {
              if (res.data.code === 200) {
                this.setState({ showMask: false, showDontTouch: true })
                toast('取消订单成功', 'success')
                setTimeout(() => {
                  Taro.switchTab({
                    url: '/pages/orderPage/index'
                  })
                }, 1000)
              } else {
                toast('取消订单失败，请检查您的网络状态后重试')
              }
            }).catch(err => {
              toast('取消订单失败，请检查您的网络状态后重试')
            })
          }
        },
      })
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
      hunterOpenId,
    } = this.state.orderInfo
    const { wallet, voucher } = this.state.userInfo
    const {
      statusInfo,
      savedOpenid,
      animation,
      showMask,
      restPay,
      isHunter
    } = this.state

    let overTime = 0
    if (hunter) {
      overTime = parseInt(hunter.getTime) + 5 * 60 * 1000
    }
    const isOverTime = Date.now() / 1000 - overTime > 0
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
                      className={['item', voucherPay ? 'payment' : null]}
                      onClick={() => this.selectPayment(1)}
                    >
                      <View className='left'>
                        <Image
                          src={require('../../assets/image/ic_voucher_pay.png')}
                          className='icon'
                        />
                        <View>代金支付</View>
                      </View>
                      <View className='right'>¥ {voucher}</View>
                    </View>
                    <View
                      className={['item', restPay ? 'payment' : null]}
                      onClick={() => this.selectPayment(2)}
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
        {
          status === 'process' && openId === savedOpenid ?
            <View className='middle' style={{ marginBottom: '20rpx' }}>
              {
                isOverTime ?
                  <View style={{ fontSize: '32rpx', fontWeight: '700', color: '#ff4e4e' }}>已超过保护时间，无法取消订单。</View> : <View style={{ fontSize: '32rpx', fontWeight: '700', color: '#ff4e4e' }}>您在 {getOverTime(overTime)} 前可无责任取消订单。</View>
              }
              <Form onSubmit={this.cancelProcessOrder} reportSubmit>
                <Button className='user--cancel-btn' formType='submit' style={{ lineHeight: 'normal' }}>取消订单</Button>
              </Form>
            </View>
            : null
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
              <View className='bottom--text'>{pay === 'rest' ? '余额支付' : '代金支付'}</View>
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
            </View>
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
            <View className='btn-wrapper'>
              <Form onSubmit={this.handleHunterCancel} reportSubmit>
                <Button className='order-price' style={{ background: '#ff4e4e' }} formType='submit'>
                  <View className='order-comfirm'>取消订单</View>
                </Button>
              </Form>
              <View className='order-price' onClick={this.handleOrderComplete}>
                <View className='order-comfirm'>完成订单</View>
              </View>
            </View>
            : null
        }
      </View>
    )
  }
}