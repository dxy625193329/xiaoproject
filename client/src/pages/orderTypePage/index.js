import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'

import './index.scss'

const typeList = [
  {
    cover: 'http://cdn.xwuyou.com/order_1.jpg',
    type: 1,
    name: '大众类需求',
    desc: '您需要的所有帮助 都可以在这里实现'
  },
  {
    cover: 'http://cdn.xwuyou.com/order_2.jpg',
    type: 2,
    name: '影分身',
    desc: '在光明中前行 亦需有影相随'
  },
]

export class OrderTypePage extends Component {

  routeToOrderBranchPage = type => {
    const path = type === 1 ? 'orderNormalPage' : 'orderShadowPage'
    Taro.navigateTo({
      url: `/pages/${path}/index?type=${type}`
    })
  }

  render() {

    return (
      <View className='type'>
        {
          typeList.map((item, index) =>
            <View
              className='item'
              style={{ backgroundImage: `url(${item.cover})` }}
              key={index}
              onClick={() => this.routeToOrderBranchPage(item.type)}
            >
              <View className='top'>
                <View className='divider left'></View>
                <View className='name'>{item.name}</View>
                <View className='divider right'></View>
              </View>
              <View className='desc'>{item.desc}</View>
            </View>
          )
        }
      </View>
    )
  }
}