export const resolveCountQuest = (tag, count) => {
  switch (tag) {
    case 1:
      if (count >= 10) {
        return { name: 'quest1', status: true }
      }
    case 2:
      if (count >= 60) {
        return { name: 'quest2', status: true }
      }
    case 3:
      if (count >= 100) {
        return { name: 'quest3', status: true }
      }
    case 4:
      if (count >= 300) {
        return { name: 'quest4', status: true }
      }
    case 5:
      if (count >= 500) {
        return { name: 'quest5', status: true }
      }
    default:
      return { name: 'quest', status: false }
  }
}

export const resolveLevelQuest = (tag, level) => {
  let name = level.name
  switch (tag) {
    case 6:
      if (name === '白银猎人') {
        return { name: 'quest5', status: true }
      }
    case 7:
      if (name === '黄金猎人') {
        return { name: 'quest6', status: true }
      }
    case 8:
      if (name === '白金猎人') {
        return { name: 'quest7', status: true }
      }
    case 9:
      if (name === '王者猎人') {
        return { name: 'quest8', status: true }
      }
    default:
      return { name: 'quest', status: false }
  }
}