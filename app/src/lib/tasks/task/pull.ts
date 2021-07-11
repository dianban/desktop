import { ActionType, ITaskItem, RuleType } from '../model'
import {
  configPullRebase,
  mergeBaseBranchUpstream,
  pullCurrentRemote,
} from '../git'
import { currentRemote, tipIsValid } from '../git-store'
import { endNode, startNode } from '../node'

export const taskPull: ITaskItem = {
  name: '更新（pull）',
  actions: {
    start: {
      type: ActionType.defaultNode,
      opts: startNode,
      next: [
        {
          to: '0',
        },
      ],
    },
    '0': {
      type: ActionType.gitStore,
      opts: currentRemote,
      next: [
        {
          ruleType: RuleType.success,
          to: '1',
        },
      ],
    },
    '1': {
      type: ActionType.gitStore,
      opts: tipIsValid,
      next: [
        {
          ruleType: RuleType.success,
          to: 'mergeBase',
        },
      ],
    },
    mergeBase: {
      type: ActionType.git,
      opts: mergeBaseBranchUpstream,
      next: [
        {
          ruleType: RuleType.success,
          to: '2',
        },
      ],
    },
    '2': {
      type: ActionType.git,
      opts: configPullRebase,
      next: [
        {
          ruleType: RuleType.success,
          to: 'gitPull',
        },
      ],
    },
    gitPull: {
      type: ActionType.git,
      opts: pullCurrentRemote,
      next: [
        {
          ruleType: RuleType.success,
          to: 'end',
        },
      ],
    },
    end: {
      type: ActionType.defaultNode,
      opts: endNode,
      next: [],
    },
  },
}
