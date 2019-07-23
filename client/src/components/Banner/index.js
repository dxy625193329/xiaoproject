import Taro, { Component } from '@tarojs/taro'
import { View, Swiper, SwiperItem } from '@tarojs/components'
import './index.scss'
import { set } from '../../lib/global'

export default class Banner extends Component {

  state = {
    banners: [],
    currentIndex: 0,
    margin: '40px',
    animationEnlarge: {},
    animationShrink: {}
  }

  // https://github.com/NervJS/taro/issues/11#issuecomment-395400150
  static getDerivedStateFromProps(props, state) {
    if (props.banners !== state.banners) {
      return {
        banners: props.banners
      }
    }
    return null
  }

  handleChange = e => {
    this.setState({ currentIndex: e.detail.current })
    this.changeStatus(1, 1, 'active')
    this.changeStatus(0.9, 0.8, 'normal')
  }

  changeStatus = (scale, opacity, status) => {
    let animation = Taro.createAnimation({
      duration: 500,
      timingFunction: 'ease'
    })
    animation.scale(scale)
    animation.opacity(opacity)
    animation.step()
    if (status === 'active') {
      this.setState({ animationEnlarge: animation.export() })
    } else {
      this.setState({ animationShrink: animation.export() })
    }
  }

  handleBannerClick = item => {
    set('banner', item.content)
    Taro.navigateTo({
      url: '/pages/bannerPage/index'
    })
  }


  render() {
    const { margin, currentIndex, animationEnlarge, animationShrink, banners } = this.state
    return (
      <View className='banner--wrapper'>
        <Swiper
          className='swiper'
          previousMargin={margin}
          nextMargin={margin}
          interval={3000}
          circular
          autoplay
          onChange={this.handleChange}
        >
          {
            banners.map((item, index) =>
              <SwiperItem
                key={item._id}
                className='swiper--item'
                onClick={() => this.handleBannerClick(item)}
              >
                <View
                  className={['banner', currentIndex === index ? 'active-item' : 'item']}
                  animation={currentIndex === index ? animationEnlarge : animationShrink}
                  style={{ backgroundImage: `url(${item.bgCover})` }}
                >
                  <View className='title'>{item.title}</View>
                  <View className='desc'>{item.subTitle !== '' ? item.subTitle : '点击查看详情'}</View>
                </View>
              </SwiperItem>
            )
          }
        </Swiper>
        <View className='swiper--dot'>
          <ul>
            {
              banners.map((item, index) =>
                <View
                  key={index}
                  className={['dot', currentIndex === index ? 'dot--active' : null]}
                ></View>
              )
            }
          </ul>
        </View>
      </View>
    )
  }
}