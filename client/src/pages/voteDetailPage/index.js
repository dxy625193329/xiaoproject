import Taro, { Component } from '@tarojs/taro'
import { View, Input } from '@tarojs/components'
import { get, set } from '../../lib/global'
import { formatVoteTime } from "../../lib/time"
import { toast } from "../../lib/utils"
import { updateVoteInfo, updateUser } from '../../api'

import './index.scss'

export default class voteDetailPage extends Component {

  config = {
    usingComponents: {
      wemark: '../../wemark/wemark'
    }
  }

  state = {
    vote: {},
    isJoined: false,
    hasTicket: false,
    ticketId: '',
    showHot: false,
    hotItem: {},
    hotCount: 0,
    user: {},
    poolPay: false,
    restPay: false,
    voucherPay: false
  }

  componentDidMount() {
    const vote = get('vote')
    set('voteId', vote['_id'])
    set('voteName', vote['title'])
    vote.players.map(item => {
      if (item.openId === Taro.getStorageSync('openid')) {
        this.setState({ isJoined: true })
        return
      }
    })
    this.setState({ vote, user: get('user') })
    const ticketObj = Taro.getStorageSync('dayTicket')
    if (ticketObj) {
      if (formatVoteTime(Date.now()) === ticketObj.date) {
        this.setState({ hasTicket: true, ticketId: ticketObj.id })
      }
    }
  }

  routeToJoinPage = () => {
    if (this.state.isJoined) {
      return
    } else {
      Taro.navigateTo({
        url: '/pages/voteJoinPage/index'
      })
    }
  }

  viewImage = image => {
    Taro.previewImage({
      current: image,
      urls: [image],
    })
  }

  ticketIt = item => {
    const { vote, hasTicket } = this.state
    if (hasTicket) {
      toast('今日已投过票啦，明天再来吧!')
    } else {
      if (vote.players) {
        vote.players.map(player => {
          if (player.openId === item.openId) {
            player.count++
            updateVoteInfo({ voteId: vote._id, player }).then(res => {
              this.setState({ vote, hasTicket: true, ticketId: player.openId })
              return
            })
          }
        })
      }
      Taro.setStorageSync('dayTicket', {
        id: item.openId,
        date: formatVoteTime(Date.now())
      })
      toast('投票成功')
    }
  }

  handleInput = e => {
    this.setState({ hotCount: Math.ceil(e.target.value) })
  }

  preventTouchMove = () => { }

  selectPayment = index => {
    if (index === 1) {
      this.setState({ poolPay: true, voucherPay: false, restPay: false })
    } else if (index === 2) {
      this.setState({ poolPay: false, voucherPay: true, restPay: false })
    } else {
      this.setState({ poolPay: false, voucherPay: false, restPay: true })
    }
  }

  handleOrderPay = () => {
    const user = { ...this.state.user }
    const vote = { ...this.state.vote }
    const { hotItem } = this.state
    if (isNaN(this.state.hotCount)) {
      toast('请输入正确的数量')
      return
    }
    if (this.state.poolPay) {
      if (user.pool - this.state.hotCount * 0.9 >= 0) {
        let { pool } = user
        pool -= this.state.hotCount * 0.9
        pool = parseFloat(pool.toFixed(1))
        user.pool = pool
        if (vote.players) {
          vote.players.map(player => {
            if (player.openId === hotItem.openId) {
              player.count += this.state.hotCount
              player.giftCount += this.state.hotCount
              player.gift.push({
                openId: Taro.getStorageSync('openid'),
                count: this.state.hotCount
              })
              updateVoteInfo({ voteId: vote._id, player }).then(res => {
                toast('🚀赠送成功')
                this.setState({
                  showHot: false, hotCount: 0, user, poolPay: false,
                  restPay: false,
                  voucherPay: false
                })
              })
              updateUser({ user })
              set('user', user)
            }
          })
        }
      } else {
        toast('奖金池余额不足，请选择其他支付方式')
      }
    }
    if (this.state.voucherPay) {
      if (user.voucher - this.state.hotCount * 0.9 >= 0) {
        let { voucher } = user
        voucher -= this.state.hotCount * 0.9
        voucher = parseFloat(voucher.toFixed(1))
        user.voucher = voucher
        if (vote.players) {
          vote.players.map(player => {
            if (player.openId === hotItem.openId) {
              player.count += this.state.hotCount
              player.giftCount += this.state.hotCount
              player.gift.push({
                openId: Taro.getStorageSync('openid'),
                count: this.state.hotCount
              })
              updateVoteInfo({ voteId: vote._id, player }).then(res => {
                toast('🚀赠送成功')
                this.setState({
                  showHot: false, hotCount: 0, user, poolPay: false,
                  restPay: false,
                  voucherPay: false
                })
              })
              updateUser({ user })
              set('user', user)
            }
          })
        }
      } else {
        toast('代金余额不足，请选择其他支付方式')
      }
    }
    if (this.state.restPay) {
      if (user.wallet - this.state.hotCount * 0.9 >= 0) {
        let { wallet } = user
        wallet -= this.state.hotCount * 0.9
        wallet = parseFloat(wallet.toFixed(1))
        user.wallet = wallet
        if (vote.players) {
          vote.players.map(player => {
            if (player.openId === hotItem.openId) {
              player.count += this.state.hotCount
              player.giftCount += this.state.hotCount
              player.gift.push({
                openId: Taro.getStorageSync('openid'),
                count: this.state.hotCount
              })
              updateVoteInfo({ voteId: vote._id, player }).then(res => {
                toast('🚀赠送成功')
                this.setState({
                  showHot: false, hotCount: 0, user, poolPay: false,
                  restPay: false,
                  voucherPay: false
                })
              })
              updateUser({ user })
              set('user', user)
            }
          })
        }
      } else {
        toast('钱包余额不足，请选择其他支付方式')
      }
    }
  }

  render() {
    const { vote, isJoined, hasTicket, ticketId, showHot, hotCount, user, poolPay, restPay, voucherPay } = this.state

    return (
      <View className='vote-wrapper'>
        <View className='vote-subtitle'>{vote.subTitle}</View>
        <View className={['vote-join', isJoined ? 'has-joined' : '']} onClick={this.routeToJoinPage}>{isJoined ? '你已参加了本次投票活动' : '点击参加投票活动'}</View>
        <View className='vote-players-title'>参加投票的选手</View>
        <View className='vote-players'>
          {
            vote.players && vote.players.length === 0 && <View className='no-player'>还没有选手参加</View>
          }
          {
            vote.players && vote.players.length > 0 && vote.players.map((item, index) =>
              <View className='vote-item' key={index}>
                <Image src={item.image} className='vote-image' onClick={() => this.viewImage(item.image)} />
                <View className='vote-info'>
                  <View className='player-name'>{item.name}</View>
                  <View className='player-count'>{item.count} 票</View>
                  <View className={['ticket', ticketId === item.openId ? 'has-ticket' : '']} onClick={() => this.ticketIt(item)}>{ticketId === item.openId ? '👍 已投票' : '👍 给他投票'}</View>
                  {
                    hasTicket && <View className='hot' onClick={() => this.setState({ showHot: true, hotItem: item })}>🚀 点击开启热度小助手</View>
                  }
                </View>
              </View>
            )
          }
        </View>
        {
          showHot ?
            <View catchtouchmove={this.preventTouchMove}>
              <View className='mask' onClick={() => this.setState({
                showHot: false,
                hotCount: 0,
                poolPay: false,
                restPay: false,
                voucherPay: false
              })}></View>
              <View className='mask--wrapper'>
                <View className='mask--content'>
                  <View className='title'>🚀 热度小助手</View>
                  <View className='desc'>当您的每日投票次数用尽后，可以开启热度小助手，继续为您支持的选手投票，1🚀 = 1票。</View>
                  <View className='input'>输入您想赠送的数量（0.9元/个）</View>
                  <Input type='number' value={hotCount} onInput={this.handleInput} className='input-wrapper' />
                  <View className='count'>合计：¥{isNaN(hotCount) ? 0 : hotCount * 0.9}</View>
                  <View className='pay-desc'>选择支付方式</View>
                  <View className='pay'>
                    <View
                      className={['item', poolPay ? 'payment' : null]}
                      onClick={() => this.selectPayment(1)}
                    >
                      <View className='left'>
                        <Image
                          src={require('../../assets/image/ic_rest_pay.png')}
                          className='icon'
                        />
                        <View>奖金池支付</View>
                      </View>
                      <View className='right'>¥ {user.pool}</View>
                    </View>
                    <View
                      className={['item', voucherPay ? 'payment' : null]}
                      onClick={() => this.selectPayment(2)}
                    >
                      <View className='left'>
                        <Image
                          src={require('../../assets/image/ic_voucher_pay.png')}
                          className='icon'
                        />
                        <View>代金支付</View>
                      </View>
                      <View className='right'>¥ {user.voucher}</View>
                    </View>
                    <View
                      className={['item', restPay ? 'payment' : null]}
                      onClick={() => this.selectPayment(3)}
                    >
                      <View className='left'>
                        <Image
                          src={require('../../assets/image/ic_rest_pay.png')}
                          className='icon'
                        />
                        <View>余额支付</View>
                      </View>
                      <View className='right'>¥ {user.wallet}</View>
                    </View>
                  </View>
                  <View className='check' onClick={this.handleOrderPay}>支付</View>
                </View>
              </View>
            </View>
            : null
        }
        <wemark md={vote.content} type='wemark' />
      </View>
    )
  }
}