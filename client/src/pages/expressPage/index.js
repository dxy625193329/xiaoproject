import Taro, { Component } from '@tarojs/taro'
import { View, Input, Picker, Switch } from '@tarojs/components'
import './index.scss'
import { get, set } from '../../lib/global'
import { getFullTime } from '../../lib/time'
import { getTypeInfo } from '../../lib/utils'

export class expressPage extends Component {

  state = {
    typeInfo: {},
    user: {},
    username: '',
    siteSelector: ['顺丰', '邮政', '圆通', '中通', '申通', '韵达', '百世', '天天', '四食堂快递点', '其他(需自行联系代取点)'],
    siteSelectorChecked: '顺丰',
    sizeSelector: ['小', '中', '大'],
    sizeSelectorChecked: '小',
    price: 0,
    totalPrice: 3,
    addressText: '',
    needText: '',
    privateText: '',
    date: '',
    time: '',
    pool: 0,
    checkUsername: false,
    checkAddress: false,
    checkSpeed: false,
    checkImage1: false,
    checkImage2: false,
    checkPool: false,
    tempOrder: {},
    tempImageUrl1: '',
    tempImageUrl2: '',
    needSpeed: false,
    speed: 0
  }

  componentWillMount() {
    const user = get('user')
    this.setState({
      typeInfo: getTypeInfo(this.$router.params.type),
      user,
      tempOrder: Taro.getStorageSync('tempOrder')
    })
    if (user.voucher > 0 || user.wallet > 0) {
      return
    } else {
      Taro.showModal({
        title: '提示',
        content: '检测到你的钱包支付额度为0，该平台无法直接微信支付，建议充值后再继续操作，以免为您带来不必要的麻烦。',
        confirmText: '前往充值',
      }).then(res => {
        if (res.confirm) {
          Taro.switchTab({
            url: '/pages/mePage/index'
          })
        }
      })
    }
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
      }
    })
  }

  handleNeedSpeed = e => {
    this.setState({ needSpeed: e.detail.value })
  }

  handleSizeSelectorChange = e => {
    let tempPrice = 0
    switch (e.detail.value) {
      case '0':
        tempPrice = 3
        break
      case '1':
        tempPrice = 5
        break
      case '2':
        tempPrice = 8
        break
    }
    this.setState({ sizeSelectorChecked: this.state.sizeSelector[e.detail.value], totalPrice: tempPrice })
  }

  handleSiteSelectorChange = e => {
    this.setState({ siteSelectorChecked: this.state.siteSelector[e.detail.value] })
  }

  handleInputChange = e => {
    if (e.target.id === 'speed') {
      if (isNaN(e.target.value) || e.target.value === '') {
        this.setState({ speed: 0 })
        return
      } else {
        this.setState({ speed: parseFloat(parseFloat(e.target.value).toFixed(2)) })
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
      siteSelectorChecked,
      sizeSelectorChecked,
      needSpeed,
      speed,
      tempImageUrl1,
      tempImageUrl2,
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
      typeText: '快递类需求',
      rank: typeInfo.rank,
      phoneNumber: user.phoneNumber,
      addressText,
      price: needSpeed ? totalPrice + speed : totalPrice,
      siteText: siteSelectorChecked,
      sizeText: sizeSelectorChecked,
      needSpeed,
      speed,
      expressInfoImage: tempImageUrl1,
      authInfoImage: tempImageUrl2,
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
    if (!tempImageUrl1) {
      this.setState({ checkImage1: true })
    } else {
      this.setState({ checkImage1: false })
    }
    if (!tempImageUrl2) {
      this.setState({ checkImage2: true })
    } else {
      this.setState({ checkImage2: false })
    }
    if (isNaN(speed) || speed < 1 || speed === '') {
      this.setState({ checkSpeed: true })
    } else {
      this.setState({ checkSpeed: false })
    }
    if (isNaN(pool) || pool < 0 || pool === '' || pool > ((totalPrice+speed) / 10) || pool >= 50 || pool > (totalPrice+speed) || pool > user.pool) {
      this.setState({ checkPool: true })
    } else {
      this.setState({ checkPool: false })
    }
    if ((needSpeed ? !isNaN(speed) && speed >= 1 : true) && !!username && !!tempImageUrl1 && !!tempImageUrl2 && !!addressText && pool >= 0 && pool <= (totalPrice+speed) && pool <= 50 && pool <= ((totalPrice+speed) / 10) && pool <= user.pool) {
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
      sizeSelector,
      sizeSelectorChecked,
      addressText,
      checkUsername,
      checkAddress,
      checkSpeed,
      checkImage1,
      checkImage2,
      checkPool,
      user,
      totalPrice,
      siteSelectorChecked,
      siteSelector,
      tempImageUrl1,
      tempImageUrl2,
      needSpeed,
      speed
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
              placeholder='请输入收货地址（如4栋201）'
              cursor-spacing='100px'
            />
          </View>
          {
            checkAddress && <View className='error-info'>请输入收货地址</View>
          }
        </View>
        <View className='order--locate'>
          <View className='locate--top'>
            <View className='title'>快递点选择</View>
            <Picker mode='selector' range={siteSelector} onChange={this.handleSiteSelectorChange}>
              <View className='right'>
                <View className='right--title'>{siteSelectorChecked}</View>
                <Image
                  src={require('../../assets/image/ic_arrow.png')}
                  className='arrow'
                />
              </View>
            </Picker>
          </View>
        </View>
        <View className='order--locate'>
          <View className='locate--top'>
            <View className='title'>时间限制(某时间前)</View>
            <Picker
              id='time'
              mode='time'
              value={time}
              onChange={this.handleInputChange}
            >
              <View className='right'>
                <View className='right--title'>{time != '' ? time : '不限'}</View>
                <Image
                  src={require('../../assets/image/ic_arrow.png')}
                  className='arrow'
                />
              </View>
            </Picker>
          </View>
        </View>
        <View className='order--locate'>
          <View className='locate--top' style={{ marginBottom: '6px ' }}>
            <View className='title'>快递大小</View>
            <Picker mode='selector' range={sizeSelector} onChange={this.handleSizeSelectorChange}>
              <View className='right'>
                <View className='right--title'>{sizeSelectorChecked}</View>
                <Image
                  src={require('../../assets/image/ic_arrow.png')}
                  className='arrow'
                />
              </View>
            </Picker>
          </View>
          <View className='info'>请严格按照实际情况选择快递规格和快递点，若猎人发现实物与任务信息不同，猎人有权拒绝执行任务。</View>
        </View>
        <View className='order--locate'>
          <View className='locate--top' style={{ marginBottom: '6px ' }}>
            <View className='title'>是否加急</View>
            <Switch color="#72C9AA" onChange={this.handleNeedSpeed} />
          </View>
          {
            needSpeed &&
            <View className='local--bottom'>
              <View className='title'>
                加急金额
              </View>
              <Input
                id='speed'
                onInput={this.handleInputChange}
                type='digit'
                value={speed}
                placeholder='最低1元起'
                cursor-spacing='100px'
                maxLength='5'
                className='input' />
            </View>
          }
        </View>
        {
          (needSpeed && checkSpeed) && <View className='error-info' style={{ margin: '0 20px' }}>请正确输入加急金额，最低1元起</View>
        }
        <View
          id="image1"
          className='be__hunter--upload'
          onClick={this.handleImageChoose}
        >
          {
            tempImageUrl1 === '' ? <View className='text'>点击此处上传您的快递信息(手机号码、快递柜密码截图)</View> :
              <Image src={tempImageUrl1} className='image' />
          }
        </View>
        {
          checkImage1 && <View className='error-info' style={{ margin: '0 20px' }}>请上传您的快递信息</View>
        }
        <View
          id="image2"
          className='be__hunter--upload'
          onClick={this.handleImageChoose}
        >
          {
            tempImageUrl2 === '' ? <View className='text'>点击此处上传您的身份信息(校卡、学生证、支付宝实名认证等)</View> :
              <Image src={tempImageUrl2} className='image' />
          }
        </View>
        {
          checkImage2 && <View className='error-info' style={{ margin: '0 20px' }}>请上传您的身份信息</View>
        }
        <View className='bottom'>
          <View className='bottom--item'>
            <View className='bottom--title'>费用</View>
            <View className='bottom--text'>
              <View className='singal'>¥</View>
              <View className='price'>{totalPrice + speed}</View>
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
                  checkPool && <View className='error-info'>本次折扣最多{((totalPrice+speed) * 0.1).toFixed(1)}元，当前可用奖金池{user.pool}元</View>
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
            <View className='price'>{totalPrice+speed}</View>
          </View>
        </View>
      </View>
    )
  }
}