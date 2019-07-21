import moment from 'moment'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')

const getTime = () => {
  return moment().format('dddd')
}

const getDay = () => {
  return moment().format('A')
}

const getNowDay = () => {
  return moment().format('YYYY-MM-DD')
}

const getFullTime = () => {
  return moment().format('lll')
}

const fromNow = time => {
  return moment(time).fromNow()
}

export {
  getDay,
  getFullTime,
  getTime,
  fromNow,
  getNowDay
}