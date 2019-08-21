import dayjs from 'dayjs'
import RelativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(RelativeTime)
dayjs.locale('zh-cn')

const getTime = () => {
  return dayjs().format('dddd')
}

const getDay = () => {
  let timeStr = ''
  switch (dayjs().format('A')) {
    case 'AM':
      timeStr = '早上'
      break
    case 'PM':
      timeStr = '下午'
      break
    default:
      timeStr = '晚上'
  }
  return timeStr
}

const getNowDay = () => {
  return dayjs().format('YYYY-MM-DD')
}

const getFullTime = () => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

const fromNow = time => {
  return dayjs(time).fromNow()
}

const getOverTime = time => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

export {
  getDay,
  getFullTime,
  getTime,
  fromNow,
  getNowDay,
  getOverTime
}