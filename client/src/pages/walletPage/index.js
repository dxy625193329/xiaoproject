import Taro, { Component } from '@tarojs/taro'
import { View, Input } from '@tarojs/components'
import './index.scss'
import { get } from '../../lib/global'
import { getPay, updateUser, cashOut } from '../../api'
import { toast } from '../../lib/utils';

export default class WalletPage extends Component {

  state = {
    wallet: 0,
    pool: 0,
    value: 0,
    voucher: 0,
    showPayInMask: false,
    showCashOutMask: false,
    animation: {},
  }

  componentDidMount() {
    const { wallet, pool, voucher } = get('user')
    this.setState({ wallet, pool, voucher })
  }

  hideMask = tag => {
    this.maskAnimation(tag)
  }

  maskAnimation = (tag, flag = 'hide') => {
    if (flag === 'show') {
      let animation = Taro.createAnimation({
        duration: 150,
        timingFunction: 'ease',
      })
      animation.translateY(300)
      animation.step()
      if (tag === 1) {
        this.setState({
          animation: animation.export(),
          showPayInMask: true
        })
        setTimeout(() => {
          animation.translateY(0)
          animation.step()
          this.setState({ animation: animation.export() })
        }, 50)
      } else {
        this.setState({
          animation: animation.export(),
          showCashOutMask: true
        })
        setTimeout(() => {
          animation.translateY(0)
          animation.step()
          this.setState({ animation: animation.export() })
        }, 50)
      }
    } else {
      if (tag === 1) {
        this.setState({ showPayInMask: false, value: 0 })
      } else {
        this.setState({ showCashOutMask: false, value: 0 })
      }
    }
  }

  handlePayIn = () => {
    let { wallet, value, voucher } = this.state
    const user = get('user')
    const openId = Taro.getStorageSync('openid')
    const { firstRecharge } = user
    let price = Number(value)
    this.setState({ showPayInMask: false })
    if (price > 0.01 && !isNaN(price)) {
      let orderId = parseInt(Date.now() * Math.random())
      getPay({ orderId, price, openId }).then(res => {
        if (res.data.status === 200) {
          const { timeStamp, nonceStr, signType, paySign } = res.data
          const payPackage = res.data.package
          this.setState({ value: 0 })
          wx.requestPayment({
            timeStamp,
            nonceStr,
            package: payPackage,
            signType,
            paySign,
            success: res => {
              if (res.errMsg === 'requestPayment:ok') {
                let reslut = price
                wallet += reslut
                wallet = parseFloat(wallet.toFixed(2))
                user.wallet = wallet
                if (!firstRecharge) {
                  if (reslut >= 100) {
                    voucher += 15
                    user.firstRecharge = true
                  } else if (reslut >= 50) {
                    voucher += 10
                    user.firstRecharge = true
                  } else if (reslut >= 20) {
                    voucher += 2
                    user.firstRecharge = true
                  }
                  user.voucher = voucher
                }
                this.setState({ wallet, voucher })
                updateUser({ user })
                toast('充值成功', 'success')
              }
            },
            fail: err => {
              if (err.errMsg === 'requestPayment:fail cancel') {
                this.setState({ showPayInMask: false, value: 0 })
                toast('取消充值')
              } else {
                this.setState({ showPayInMask: false, value: 0 })
                toast('充值失败，请稍后再试')
              }
            }
          })
        } else {
          toast('充值失败，请稍后再试')
        }
      })
    }
  }

  handleCashOut = () => {
    let { wallet, value, pool } = this.state
    let user = get('user')
    const openId = Taro.getStorageSync('openid')
    let money = Number(value)
    if (money >= 0.3 && !isNaN(money) && money <= wallet) {
      let orderId = parseInt(Date.now() * Math.random())
      this.setState({ showCashOutMask: false })
      cashOut({ openId, orderId, money }).then(res => {
        if (res.data.status === 200) {
          user.wallet -= money
          user.wallet = parseFloat((user.wallet).toFixed(2))
          user.pool = 0
          wallet -= money
          wallet = parseFloat(wallet.toFixed(2))
          pool = 0
          this.setState({ wallet, pool, value: 0 })
          Taro.showToast({
            title: '提现成功',
            icon: 'success',
            duration: 2000
          })
          updateUser({ user })
        } else {
          this.setState({ value: 0 })
          Taro.showToast({
            title: '提现失败，请联系客服',
            icon: 'none',
            duration: 2000
          })
        }
      }).catch(err => {
        Taro.showToast({
          title: '提现失败,请检查网络',
          icon: 'none',
          duration: 2000
        })
      })
    }
  }

  showPayInMask = () => {
    this.setState({ showPayInMask: true })
  }

  showCashOutMask = () => {
    this.setState({ showCashOutMask: true })
  }

  handleInputChange = e => {
    this.setState({ value: e.target.value })
  }

  preventTouchMove = () => { }

  render() {
    const { wallet, pool, voucher, showPayInMask, value } = this.state

    return (
      <View className='wallet'>
        <View className='wallet--title'>钱包</View>
        <View className='wallet--info'>钱包分为余额、代金池和奖金池，有不同的功能</View>
        <View className='wallet--item'>
          <View className='title'>余额</View>
          <View className='desc'>可提现，也可以消费，提现后奖金池清空</View>
          <View className='desc'>来源于用户充值或猎人完成订单的奖励</View>
          <View className='money'>
            <View className='wrapper'>
              <View className='singal'>¥</View>
              <View className='num'>{wallet}</View>
            </View>
            <View className='btns'>
              <View className='get' onClick={this.showPayInMask}>充值</View>
              <View className='get' onClick={this.showCashOutMask}>提现</View>
            </View>
          </View>
        </View>
        <View className='wallet--item'>
          <View className='title'>代金池</View>
          <View className='desc'>不可提现，可使用代金池内金额支付订单</View>
          <View className='desc'>来源于充值活动或其他用户反馈活动</View>
          <View className='money'>
            <View className='wrapper'>
              <View className='singal'>¥</View>
              <View className='num'>{Number(voucher.toFixed(2))}</View>
            </View>
          </View>
        </View>
        <View className='wallet--item'>
          <View className='title'>奖金池</View>
          <View className='desc'>不可提现，只能在交易时作为折扣使用</View>
          <View className='desc'>来源于猎人完成订单的奖励</View>
          <View className='money'>
            <View className='wrapper'>
              <View className='singal'>¥</View>
              <View className='num'>{Number(pool.toFixed(2))}</View>
            </View>
          </View>
        </View>
        {
          showPayInMask ? <View catchtouchmove={this.preventTouchMove}>
            <View className='mask' onClick={() => this.hideMask(1)}></View>
            <View animation={animation} className='mask--wrapper'>
              <View className='mask--content'>
                <View className='title'>余额充值</View>
                <View className='desc'>充值金额</View>
                <View className='input--wrapper'>
                  <View
                    className='prefix'
                  >¥</View>
                  <Input className='input' cursor-spacing='100px' value={value} onInput={this.handleInputChange} />
                </View>
                <View className='info'>充值金额必须大于0.1元</View>
                <View className='check' onClick={this.handlePayIn}>充值</View>
              </View>
            </View>
          </View> : null
        }
        {
          showCashOutMask ? <View catchtouchmove={this.preventTouchMove}>
            <View className='mask' onClick={() => this.hideMask(2)}></View>
            <View animation={animation} className='mask--wrapper'>
              <View className='mask--content'>
                <View className='title'>余额提现</View>
                <View className='desc'>提现金额</View>
                <View className='input--wrapper'>
                  <View
                    className='prefix'
                  >¥</View>
                  <Input className='input' cursor-spacing='100px' value={value} onInput={this.handleInputChange} />
                </View>
                <View className='info'>提现金额必须大于0.3元，单次提现金额小于100元，当天累计不超过1000元</View>
                <View className='check' onClick={this.handleCashOut}>提现</View>
              </View>
            </View>
          </View> : null
        }
      </View>
    )
  }
}
