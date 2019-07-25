import Taro, { Component } from '@tarojs/taro'
import Index from './pages/indexPage/index'

class App extends Component {

  config = {
    pages: [
      'pages/splashPage/index',
      'pages/indexPage/index',
      'pages/orderPage/index',
      'pages/rankPage/index',
      'pages/mePage/index',
      'pages/orderTypePage/index',
      'pages/taskHallPage/index',
      'pages/orderNormalPage/index',
      'pages/orderShadowPage/index',
      'pages/orderDetailPage/index',
      'pages/bannerPage/index',
      'pages/feedBackPage/index',
      'pages/beHunterPage/index',
      'pages/walletPage/index',
      'pages/questPage/index',
      'pages/servicePage/index',
      'pages/agreePage/index',
      'pages/hunterAgreePage/index',
      'pages/imListPage/index',
      'pages/messagePage/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#F8F8F8',
      navigationBarTitleText: '校无忧',
      navigationBarTextStyle: 'black',
      backgroundColor: '#F8F8F8'
    },
    tabBar: {
      backgroundColor: '#F8F8F8',
      color: '#919191',
      selectedColor: '#303030',
      borderStyle: 'black',
      list: [
        {
          pagePath: 'pages/indexPage/index',
          text: '主页',
          iconPath: './assets/image/ic_home_normal.png',
          selectedIconPath: './assets/image/ic_home_selected.png'
        },
        {
          pagePath: 'pages/orderPage/index',
          text: '订单',
          iconPath: './assets/image/ic_order_normal.png',
          selectedIconPath: './assets/image/ic_order_selected.png'
        },
        {
          pagePath: 'pages/rankPage/index',
          text: '排行榜',
          iconPath: './assets/image/ic_rank_normal.png',
          selectedIconPath: './assets/image/ic_rank_selected.png'
        },
        {
          pagePath: 'pages/mePage/index',
          text: '我的',
          iconPath: './assets/image/ic_me_normal.png',
          selectedIconPath: './assets/image/ic_me_selected.png'
        }
      ]
    },
    permission: {
      'scope.userLocation': {
        desc: '您的位置将帮助我们为您提供更优质的服务。'
      }
    }
  }

  componentDidMount() {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init()
    }
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Index />
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
