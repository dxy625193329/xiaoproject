import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'
import { get } from '../../lib/global'
import { resolveCountQuest, resolveLevelQuest } from '../../lib/quest'
import { getNowDay } from '../../lib/time'
import { updateUser } from '../../api'
import { toast } from '../../lib/utils'

export default class QuestPage extends Component {

  state = {
    userInfo: {},
    quest: [
      { name: 'quest1', status: false },
      { name: 'quest2', status: false },
      { name: 'quest3', status: false },
      { name: 'quest4', status: false },
      { name: 'quest5', status: false },
      { name: 'quest6', status: false },
      { name: 'quest7', status: false },
      { name: 'quest8', status: false },
      { name: 'quest9', status: false },
    ],
    dayQuestList: [],
    dayQuest1: false,
    dayQuest2: false,
    dayQuest3: false
  }

  componentDidMount() {
    const user = get('user')
    this.setState({ userInfo: user })
    for (let i = 0; i < user.dayQuest.length; i++) {
      if (user.dayQuest[i].date === getNowDay()) {
        this.setState({
          dayQuestList: user.dayQuest[i].order,
          dayQuest1: user.dayQuest[i].quest1,
          dayQuest2: user.dayQuest[i].quest2,
          dayQuest3: user.dayQuest[i].quest3
        })
      }
    }
    const { quest } = this.state
    for (let i = 0; i < quest.length; i++) {
      for (let j = 0; j < user.quest.length; j++) {
        if (user.quest[j].name === quest[i].name) {
          if (user.quest[j].status) {
            quest[i].status = true
          } else {
            quest[i].status = false
          }
        }
      }
    }
    this.setState({ quest })
  }

  calcQuestStatus = tag => {
    let obj = resolveCountQuest(tag, this.state.userInfo.hunterOrderCount)
    return obj.status
  }

  calcLevelQuestStatus = tag => {
    if (this.state.userInfo.hunterLevel) {
      let level = this.state.userInfo.hunterLevel
      let obj = resolveLevelQuest(tag, level)
      return obj.status
    }
  }

  handleGetReward = tag => {
    const { userInfo, quest } = this.state
    if (tag === 1) {
      if (this.calcQuestStatus(tag)) {
        if (!quest[0].status) {
          userInfo.quest.push({ name: 'quest1', status: true })
          userInfo.hunterOrderCount += 5
          userInfo.wallet += 5
          quest[0].status = true
          updateUser({ user: userInfo }).then(res => {
            this.setState({ quest })
          })
        }
      }
    } else {
      toast('您还未完成任务，无法领取奖励')
    }
    if (tag === 2) {
      if (this.calcQuestStatus(tag)) {
        if (!quest[1].status) {
          userInfo.quest.push({ name: 'quest2', status: true })
          userInfo.hunterOrderCount += 10
          userInfo.wallet += 20
          quest[1].status = true
          updateUser({ user: userInfo }).then(res => {
            this.setState({ quest })
          })
        }
      }
    } else {
      toast('您还未完成任务，无法领取奖励')
    }
    if (tag === 3) {
      if (this.calcQuestStatus(tag)) {
        if (!quest[2].status) {
          userInfo.quest.push({ name: 'quest3', status: true })
          userInfo.hunterOrderCount += 15
          userInfo.wallet += 40
          quest[2].status = true
          updateUser({ user: userInfo }).then(res => {
            this.setState({ quest })
          })
        }
      }
    } else {
      toast('您还未完成任务，无法领取奖励')
    }
    if (tag === 4) {
      if (this.calcQuestStatus(tag)) {
        if (!quest[3].status) {
          userInfo.quest.push({ name: 'quest4', status: true })
          userInfo.hunterOrderCount += 30
          userInfo.wallet += 100
          quest[3].status = true
          updateUser({ user: userInfo }).then(res => {
            this.setState({ quest })
          })
        }
      }
    } else {
      toast('您还未完成任务，无法领取奖励')
    }
    if (tag === 5) {
      if (this.calcQuestStatus(tag)) {
        if (!quest[4].status) {
          userInfo.quest.push({ name: 'quest5', status: true })
          userInfo.hunterOrderCount += 50
          userInfo.wallet += 200
          quest[4].status = true
          updateUser({ user: userInfo }).then(res => {
            this.setState({ quest })
          })
        }
      }
    } else {
      toast('您还未完成任务，无法领取奖励')
    }
    if (tag === 6) {
      if (this.calcLevelQuestStatus(tag)) {
        if (!quest[5].status) {
          userInfo.quest.push({ name: 'quest6', status: true })
          userInfo.wallet += 10
          quest[5].status = true
          updateUser({ user: userInfo }).then(res => {
            this.setState({ quest })
          })
        }
      }
    } else {
      toast('您还未完成任务，无法领取奖励')
    }
    if (tag === 7) {
      if (this.calcLevelQuestStatus(tag)) {
        if (!quest[6].status) {
          userInfo.quest.push({ name: 'quest7', status: true })
          userInfo.wallet += 50
          quest[6].status = true
          updateUser({ user: userInfo }).then(res => {
            this.setState({ quest })
          })
        }
      }
    } else {
      toast('您还未完成任务，无法领取奖励')
    }
    if (tag === 8) {
      if (this.calcLevelQuestStatus(tag)) {
        if (!quest[7].status) {
          userInfo.quest.push({ name: 'quest8', status: true })
          userInfo.wallet += 100
          quest[7].status = true
          updateUser({ user: userInfo }).then(res => {
            this.setState({ quest })
          })
        }
      }
    } else {
      toast('您还未完成任务，无法领取奖励')
    }
    if (tag === 9) {
      if (this.calcLevelQuestStatus(tag)) {
        if (!quest[8].status) {
          userInfo.quest.push({ name: 'quest9', status: true })
          userInfo.wallet += 300
          quest[8].status = true
          updateUser({ user: userInfo }).then(res => {
            this.setState({ quest })
          })
        }
      }
    } else {
      toast('您还未完成任务，无法领取奖励')
    }
  }

  calcShadowOrder = () => {
    let list = this.state.dayQuestList
    if (list) {
      let tempList = list.filter(item => item.type === 2)
      return tempList.length
    }
  }

  handleDayQuest = tag => {
    const { userInfo } = this.state
    if (userInfo.isHunter) {
      if (tag === 1) {
        for (let i = 0; i < userInfo.dayQuest.length; i++) {
          if (userInfo.dayQuest[i].date === getNowDay()) {
            if (userInfo.dayQuest[i].order.length > 0) {
              userInfo.hunterOrderCount += 1
              userInfo.dayQuest[i].quest1 = true
              updateUser({ user: userInfo })
              this.setState({ dayQuest1: true })
              return
            } else {
              toast('您还未完成任务，无法领取奖励')
            }
          }
        }
      }
      if (tag === 2) {
        for (let i = 0; i < userInfo.dayQuest.length; i++) {
          if (userInfo.dayQuest[i].date === getNowDay()) {
            if (userInfo.dayQuest[i].order.length >= 10) {
              userInfo.wallet += 4
              userInfo.dayQuest[i].quest2 = true
              updateUser({ user: userInfo })
              this.setState({ dayQuest2: true })
              return
            } else {
              toast('您还未完成任务，无法领取奖励')
            }
          }
        }
      }
      if (tag === 3) {
        for (let i = 0; i < userInfo.dayQuest.length; i++) {
          if (userInfo.dayQuest[i].date === getNowDay()) {
            if (userInfo.dayQuest[i].order.filter(item => item.type === 2).length >= 4) {
              userInfo.wallet += 5
              userInfo.dayQuest[i].quest3 = true
              updateUser({ user: userInfo })
              this.setState({ dayQuest3: true })
              return
            } else {
              toast('您还未完成任务，无法领取奖励')
            }
          }
        }
      }
    } else {
      toast('您不是猎人，无法完成任务')
    }
  }

  render() {
    const { userInfo, quest, dayQuestList, dayQuest1, dayQuest2, dayQuest3 } = this.state
    return (
      <View className='quest'>
        <View className='quest--title'>任务大厅</View>
        <View className='quest--info'>完成任务可领取丰厚奖励</View>
        <View className='quest--content'>
          <View className='title'>每日任务</View>
          <View className='item'>
            <View className='left'>
              <View className='name'>小试牛刀</View>
              <View className='info'>目标：完成1单任务({dayQuestList.length >= 1 ? 1 : 0}/1)</View>
              <View className='info'>奖励：总单数奖励1单</View>
            </View>
            <View className='right' onClick={() => this.handleDayQuest(1)}>
              {dayQuest1 ? '已完成' : dayQuestList.length >= 1 ? '领取奖励' : '未完成'}
            </View>
          </View>
          <View className='item'>
            <View className='left'>
              <View className='name'>坚持不懈</View>
              <View className='info'>目标：完成10单任务({dayQuestList.length >= 10 ? 10 : dayQuestList.length}/10)</View>
              <View className='info'>奖励：奖励4元</View>
            </View>
            <View className='right' onClick={() => this.handleDayQuest(2)}>
              {dayQuest2 ? '已完成' : dayQuestList.length >= 10 ? '领取奖励' : '未完成'}
            </View>
          </View>
          <View className='item'>
            <View className='left'>
              <View className='name'>影子王</View>
              <View className='info'>目标：完成4单影分身任务({this.calcShadowOrder() >= 4 ? 4 : this.calcShadowOrder()}/4)</View>
              <View className='info'>奖励：奖励5元</View>
            </View>
            <View className='right' onClick={() => this.handleDayQuest(3)}>
              {dayQuest3 ? '已完成' : this.calcShadowOrder() >= 4 ? '领取奖励' : '未完成'}
            </View>
          </View>
        </View>
        <View className='quest--content'>
          <View className='title'>累计任务</View>
          <View className='item'>
            <View className='left'>
              <View className='name'>完成10单</View>
              <View className='info'>目标：累计完成10单任务({userInfo.hunterOrderCount > 10 ? 10 : userInfo.hunterOrderCount}/10)</View>
              <View className='info'>奖励：奖励5单，奖励5元</View>
            </View>
            <View className='right' onClick={() => this.handleGetReward(1)}>
              {
                quest[0].status ? '已领取' : this.calcQuestStatus(1) ? '领取奖励' : '未完成'
              }
            </View>
          </View>
          <View className='item'>
            <View className='left'>
              <View className='name'>完成60单</View>
              <View className='info'>目标：累计完成60单任务({userInfo.hunterOrderCount > 60 ? 60 : userInfo.hunterOrderCount}/60)</View>
              <View className='info'>奖励：奖励10单，奖励20元</View>
            </View>
            <View className='right' onClick={() => this.handleGetReward(2)}>
              {
                quest[1].status ? '已领取' : this.calcQuestStatus(2) ? '领取奖励' : '未完成'
              }
            </View>
          </View>
          <View className='item'>
            <View className='left'>
              <View className='name'>完成100单</View>
              <View className='info'>目标：累计完成100单任务({userInfo.hunterOrderCount > 100 ? 100 : userInfo.hunterOrderCount}/100)</View>
              <View className='info'>奖励：奖励15单，奖励40元</View>
            </View>
            <View className='right' onClick={() => this.handleGetReward(3)}>
              {
                quest[2].status ? '已领取' : this.calcQuestStatus(3) ? '领取奖励' : '未完成'
              }
            </View>
          </View>
          <View className='item'>
            <View className='left'>
              <View className='name'>完成300单</View>
              <View className='info'>目标：累计完成300单任务({userInfo.hunterOrderCount > 300 ? 300 : userInfo.hunterOrderCount}/300)</View>
              <View className='info'>奖励：奖励30单，奖励100元</View>
            </View>
            <View className='right' onClick={() => this.handleGetReward(4)}>
              {
                quest[3].status ? '已领取' : this.calcQuestStatus(4) ? '领取奖励' : '未完成'
              }
            </View>
          </View>
          <View className='item'>
            <View className='left'>
              <View className='name'>完成500单</View>
              <View className='info'>目标：累计完成500单任务({userInfo.hunterOrderCount > 500 ? 500 : userInfo.hunterOrderCount}/500)</View>
              <View className='info'>奖励：奖励50单，奖励200元</View>
            </View>
            <View className='right' onClick={() => this.handleGetReward(5)}>
              {
                quest[4].status ? '已领取' : this.calcQuestStatus(5) ? '领取奖励' : '未完成'
              }
            </View>
          </View>
        </View>
        <View className='quest--content'>
          <View className='title'>成就任务</View>
          <View className='item'>
            <View className='left'>
              <View className='name'>晋级白银</View>
              <View className='info'>目标：成为白银猎人</View>
              <View className='info'>奖励：奖励10元</View>
            </View>
            <View className='right' onClick={() => this.handleGetReward(6)}>
              {
                quest[5].status ? '已领取' : this.calcLevelQuestStatus(6) ? '领取奖励' : '未完成'
              }
            </View>
          </View>
          <View className='item'>
            <View className='left'>
              <View className='name'>晋级黄金</View>
              <View className='info'>目标：成为黄金猎人</View>
              <View className='info'>奖励：奖励50元</View>
            </View>
            <View className='right' onClick={() => this.handleGetReward(7)}>
              {
                quest[6].status ? '已领取' : this.calcLevelQuestStatus(7) ? '领取奖励' : '未完成'
              }
            </View>
          </View>
          <View className='item'>
            <View className='left'>
              <View className='name'>晋级铂金</View>
              <View className='info'>目标：成为铂金猎人</View>
              <View className='info'>奖励：奖励100元</View>
            </View>
            <View className='right' onClick={() => this.handleGetReward(8)}>
              {
                quest[7].status ? '已领取' : this.calcLevelQuestStatus(8) ? '领取奖励' : '未完成'
              }
            </View>
          </View>
          <View className='item'>
            <View className='left'>
              <View className='name'>晋级王者</View>
              <View className='info'>目标：成为王者猎人</View>
              <View className='info'>奖励：奖励300元，颁发优秀实习证明</View>
            </View>
            <View className='right' onClick={() => this.handleGetReward(9)}>
              {
                quest[8].status ? '已领取' : this.calcLevelQuestStatus(9) ? '领取奖励' : '未完成'
              }
            </View>
          </View>
        </View>
      </View>
    )
  }
}
