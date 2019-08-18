import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'

export default class HunterAgreePage extends Component {

  render() {

    return (
      <View className='agree'>
        <View className='agree--title'>关于赏金猎人</View>
        <View className='agree--h'>第一条 押金</View>
        <View className='agree--p'>
          1.1 赏金猎人的注册需要缴纳100元押金。此押金可以在猎人主动注销资格的时候立马返回到用户的银行卡或微信零钱内。
        </View>
        <View className='agree--p'>
          1.2 押金的用途主要是以<storng>信用保证金</storng>的形式存在，当猎人没能按要求完成订单，触发赔款标准的时候，将扣除猎人的保证金以赔付用户方。（详见猎手协议）
        </View>
       
        <View className='agree--h'>第二条 猎人限制</View>
        <View className='agree--p'>
          2.1 为保障猎人的收益，平台仅开放100名猎人注册资格。（截止至2019.10.7）。
        </View>
        <View className='agree--p'>
          2.2 平台对猎人无工作要求，但若猎人超过15天不工作，平台方会主动退还猎人押金，且撤销猎人职务，将职位留给更需要的人。
        </View>
        <View className='agree--h'>第三条 猎人收益</View>
        <View className='agree--p'>
          3.1  猎人收益由<strong>余额</strong>与<strong>奖金池</strong>两部分构成。
        </View>
        <View className='agree--p'>
          3.2  每单收益的90%进入<strong>余额</strong>，剩下10%进入<strong>奖金池</strong>。
        </View>
        <View className='agree--p'>
          3.3  余额：可以再使用，可以提现，且提现无门槛，无要求，无手续费。
        </View>
        <View className='agree--p'>
          3.4  奖金池：可以再使用，不可提现，且每当<strong>余额</strong>提现，奖金池将清空。
        </View>
        <View className='agree--h'>第四条 服务费</View>
        <View className='agree--p'>
          4.1 与其他平台不同的是，无忧校园不会抽取订单里的费用作为服务费纳入自己的钱包；但是当放弃服务费模式之后，平台相当于自己切断了自己的盈利手段。为了让平台能够一直服务大家，健康且长久的活下去，我们建立了<strong>奖金池</strong>制度。奖金池将猎人订单总金额的10%变成了代金卷的形式进入猎人的钱包，当猎人有用的时候可以拿出来使用，在猎人没用的时候，这个代金卷会被清空，进入平台方，以用做平台的最低存活标准。
        </View>
        <View className='agree--h'>第五条 更多建议</View>
        <View className='agree--p'>
          5.1 平台方建议各位不要私下接取或者完成订单，因为私下接单的安全性完全得不到保障；且猎人除开订单收益之外，还可以通过自己的努力获得来自<strong>任务系统</strong>以及<strong>排行榜</strong>的收益。当猎人在平台完成的订单越多，来自<strong>任务系统</strong>以及<strong>排行榜</strong>收益就会越大，再加上订单本身带来的收益，三部分收益加在一起会比线下接单高很大一部分收益出来，所以希望各位猎人能够有长远的眼光。
        </View>
      </View>
    )
  }
}
