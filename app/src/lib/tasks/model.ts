import { GitStoreCache } from '../stores/git-store-cache'
import { Repository } from '../../models/repository'
import { RepositoryStateCache } from '../stores/repository-state-cache'
import { IActionGitOpts } from './git/model'
import { IActionGitStoreOpts } from './git-store/model'
import { IActionNodeOpts } from './node'

// tasks state
export interface ITasksState {
  readonly taskList: ReadonlyArray<ITaskQueueItem> // 任务列表
  readonly currentTaskKey: number | null // 当前任务key
  readonly tasksCache: { [key: number]: ITaskCacheItem }
}

export interface ITaskItem {
  readonly name: string
  readonly actions: TaskActions
}

export interface ITaskQueueItem extends ITaskItem {
  readonly id: number
}

export interface ITaskCacheItem {
  executionPath: ReadonlyArray<string>
  executionStatus: { [key: string]: ActionStatusType } // 执行状态
}

export enum ActionStatusType {
  waiting,
  going,
  success,
  fail,
  warning,
}

export interface ITaskStatusItem {
  readonly actionKey: string
  readonly status: ActionStatusType
}

export enum ActionType {
  defaultNode,
  git,
  gitStore,
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
  // readonly statsStore: StatsStore
  [key: string]: any
}

export type TaskActions = { [key: string]: IActionItem }
export type IActionItem =
  | {
      type: ActionType.defaultNode
      opts: IActionNodeOpts
      next: Array<INextRuleItem>
    }
  | {
      type: ActionType.git
      opts: IActionGitOpts
      next: Array<INextRuleItem>
    }
  | {
      type: ActionType.gitStore
      opts: IActionGitStoreOpts
      next: Array<INextRuleItem>
    }
