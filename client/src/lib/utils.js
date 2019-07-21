import Taro from '@tarojs/taro'

export const getTypeInfo = type => {
  switch (type) {
    case '1':
      return {
        type: 1,
        rank: true,
        title: '大众类需求',
        desc: '在这个匆忙时代，将有限的时间投入到更值得的事里，找到你的自由。'
      }
    case '2':
      return {
        type: 2,
        rank: true,
        title: '影分身',
        desc: '让影子出现在你应该出现的地方，而你出现在更重要的地方。'
      }
  }
}

export const checkOrderStatus = status => {
  let statusInfo = {}
  switch (status) {
    case 'complete':
      statusInfo = {
        title: '订单已完成',
        text: '感谢您使用校无忧，期待我们的下次相遇。'
      }
      break
    case 'confirm':
      statusInfo = {
        title: '订单等待确认完成',
        text: '猎人已完成订单，请您确认。如果有什么疑问或者问题请联系猎人或者客服。'
      }
      break
    case 'wait':
      statusInfo = {
        title: '订单等待接单',
        text: '美好的东西总是值得等待，猎人将尽快接单。'
      }
      break
    case 'process':
      statusInfo = {
        title: '订单进行中',
        text: '您的订单正在路上飞奔，猎人在全力完成您的订单。'
      }
      break
    case 'waitpay':
      statusInfo = {
        title: '订单等待付款',
        text: '请尽快付款，猎人将在第一时间接单。'
      }
      break
  }
  return statusInfo
}


// 计算等级，暂时这样
export const calcLevel = (type, count, userLevel) => {
  let { exp, name, levelUp } = userLevel
  const isHunter = type === 1
  switch (true) {
    case count === 20:
      name = isHunter ? '青铜猎人' : '青铜用户'
      levelUp = 20
      exp = 0
      break
    case count === 50:
      name = isHunter ? '白银猎人' : '白银用户'
      levelUp = 30
      exp = 0
      break
    case count === 100:
      name = isHunter ? '黄金猎人' : '黄金用户'
      levelUp = 50
      exp = 0
      break
    case count === 300:
      name = isHunter ? '铂金猎人' : '铂金用户'
      levelUp = 200
      exp = 0
      break
    case count === 500:
      name = isHunter ? '钻石猎人' : '钻石用户'
      levelUp = 200
      exp = 0
      break
    case count === 800:
      name = isHunter ? '大师猎人' : '大师用户'
      levelUp = 300
      exp = 0
      break
    case count === 1000:
      name = isHunter ? '王者猎人' : '王者用户'
      levelUp = 200
      exp = 0
      break
    case count > 1000:
      name = isHunter ? '王者猎人' : '王者用户'
      levelUp = 99999
      break
    case count < 20:
      name = isHunter ? '黑铁猎人' : '黑铁用户'
      levelUp = 20
  }
  return {
    exp, name, levelUp
  }
}

export const toast = (title, icon, duration = 2000) => {
  Taro.showToast({
    title,
    icon,
    duration
  })
}