const globalData = {}

export const set = (key, val) => {
  globalData[key] = val
}

export const get = key => {
  return globalData[key]
}