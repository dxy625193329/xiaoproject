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
    showPayInMask: false,
    showCashOutMask: false,
    animation: {},
  }

  componentDidMount() {
    const { wallet, pool } = get('user')
    this.setState({ wallet, pool })
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
        // this.setState({
        //   animation: animation.export(),
        //   showCashOutMask: true
        // })
        // setTimeout(() => {
        //   animation.translateY(0)
        //   animation.step()
        //   this.setState({ animation: animation.export() })
        // }, 50)
      }
    } else {
      if (tag === 1) {
        this.setState({ showPayInMask: false })
      } else {
        // this.setState({ showCashOutMask: false })
      }
    }
  }

  handlePayIn = () => {
    let { wallet, value } = this.state
    let user = get('user')
    const openId = get('openid')
    let price = Number(value)
    if (price > 0.01 && !isNaN(price)) {
      let orderId = parseInt(Date.now() * Math.random())
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
          let reslut = price
          wallet += reslut
          wallet = parseFloat(wallet.toFixed(2))
          this.setState({ wallet, showPayInMask: false, value: 0 })
          user.wallet = wallet
          updateUser({ user })
          Taro.showToast({
            title: '充值成功',
            icon: 'success',
            duration: 2000
          })
        }).catch(err => {
          console.log(err)
        })
      })
    }
  }

  handleCashOut = () => {
    // let { wallet, value, pool } = this.state
    // let user = get('user')
    // const openId = get('openid')
    // let money = Number(value)
    // if (money >= 0.3 && !isNaN(money) && money <= wallet) {
    //   let orderId = parseInt(Date.now() * Math.random())
    //   cashOut({ openId, orderId, money }).then(res => {
    //     if (res.data.status === 200) {
    //       Taro.showToast({
    //         title: '提现成功',
    //         icon: 'success',
    //         duration: 2000
    //       })
    //       user.wallet -= money
    //       user.wallet = parseFloat((user.wallet).toFixed(2))
    //       user.pool = 0
    //       wallet -= money
    //       wallet = parseFloat(wallet.toFixed(2))
    //       pool = 0
    //       this.setState({ wallet, pool, showCashOutMask: false, value: 0 })
    //       updateUser({ user })
    //     } else {
    //       Taro.showToast({
    //         title: '提现失败，请联系客服',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //       this.setState({ showCashOutMask: false, value: 0 })
    //     }
    //   }).catch(err => {
    //     Taro.showToast({
    //       title: '提现失败,请检查网络',
    //       icon: 'none',
    //       duration: 2000
    //     })
    //   })
    // }
  }

  showPayInMask = () => {
    this.setState({ showPayInMask: true })
  }

  showCashOutMask = () => {
    toast('因微信支付平台未完善的缘故，10月7日之后才可提现。给您带来的不便，我们感到十分抱歉。', 'none', 4000)
    // this.setState({ showCashOutMask: true })
  }

  handleInputChange = e => {
    this.setState({ value: e.target.value })
  }

  preventTouchMove = () => { }

  render() {
    const { wallet, pool, showPayInMask, value } = this.state

    return (
      <View className='wallet'>
        <View className='wallet--title'>钱包</View>
        <View className='wallet--info'>钱包分为余额和奖金池，有不同的功效</View>
        <View className='wallet--item'>
          <View className='title'>余额</View>
          <View className='desc'>可提现，也可以消费，提现后奖金池清空</View>
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
          <View className='title'>奖金池</View>
          <View className='desc'>不可提现，只能在交易时作为折扣使用</View>
          <View className='money'>
            <View className='wrapper'>
              <View className='singal'>¥</View>
              <View className='num'>{pool}</View>
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
                <View className='info'>提现金额必须大于0.3元，小于100元每次</View>
                <View className='check' onClick={this.handleCashOut}>提现</View>
              </View>
            </View>
          </View> : null
        }
      </View>
    )
  }
}
