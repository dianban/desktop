import {
  checkCurrentRemote,
  checkTipIsValid,
  recordPullWith,
} from './defaultCheck'
import { GitStoreCache } from '../stores/git-store-cache'
import { Repository } from '../../models/repository'
import { RepositoryStateCache } from '../stores/repository-state-cache'
import { StatsStore } from '../stats'
import {
  defaultPull,
  gitConfigPullRebase,
  mergeBaseBranchUpstream,
} from './defaultGit'
import { IDefaultGitOpts } from './defaultGit/model'

export enum ActionType {
  defaultNode,
  defaultGit,
  defaultCheck,
  git,
  // updateGitStore,
}

export enum RuleType {
  all, // 执行的结果不影响是否到下一步
  success, // 执行成功
  equal, // 返回结果等于ruleValue
  include, // 返回结果中包含ruleValue
  regExp, // 返回结果匹配正则
}

// 返回值的匹配规则
interface INextRuleItem {
  readonly ruleType?: RuleType
  readonly ruleValue?: string
  readonly to: string
}

export interface IActionArgs {
  readonly repository: Repository
  readonly gitStoreCache: GitStoreCache
  readonly repositoryStateCache: RepositoryStateCache
  readonly statsStore: StatsStore
  [key: string]: any
}

export type IActionItem =
  | {
      type: ActionType.defaultNode
      next: Array<INextRuleItem>
    }
  | {
      type: ActionType.defaultGit
      opts: IDefaultGitOpts
      next: Array<INextRuleItem>
    }
  | {
      type: ActionType.defaultCheck
      fn: (args: IActionArgs) => any
      next: Array<INextRuleItem>
    }
  | {
      type: ActionType.git
      next: Array<INextRuleItem>
    }

const actionDefaultCheck = {
  checkCurrentRemote: checkCurrentRemote,
  checkTipIsValid: checkTipIsValid,
  recordPullWith: recordPullWith,
  gitConfigPullRebase: gitConfigPullRebase,
}

type TaskType = { [key: string]: IActionItem }
export const testTask: TaskType = {
  start: {
    type: ActionType.defaultNode,
    next: [
      {
        to: '0',
      },
    ],
  },
  '0': {
    type: ActionType.defaultCheck,
    fn: actionDefaultCheck.checkCurrentRemote,
    next: [
      {
        ruleType: RuleType.success,
        to: '1',
      },
    ],
  },
  '1': {
    type: ActionType.defaultCheck,
    fn: actionDefaultCheck.checkTipIsValid,
    next: [
      {
        ruleType: RuleType.success,
        to: 'mergeBase',
      },
    ],
  },
  mergeBase: {
    type: ActionType.defaultGit,
    opts: mergeBaseBranchUpstream,
    next: [
      {
        ruleType: RuleType.success,
        to: '2',
      },
    ],
  },
  '2': {
    type: ActionType.defaultGit,
    opts: gitConfigPullRebase,
    next: [
      {
        ruleType: RuleType.success,
        to: 'gitPull',
      },
    ],
  },
  gitPull: {
    type: ActionType.defaultGit,
    opts: defaultPull,
    next: [
      {
        ruleType: RuleType.success,
        to: 'end',
      },
    ],
  },
  end: {
    type: ActionType.defaultNode,
    next: [],
  },
}
