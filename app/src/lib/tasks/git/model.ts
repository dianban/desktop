import { IActionOpts } from '../common/model'

export enum ActionGitName {
  pullCurrentRemote,
  configPullRebase,
  mergeBaseBranchUpstream,
}

export interface IActionGitOpts extends IActionOpts {
  readonly args: string[]
  readonly successExitCodes?: number[]
  readonly needAccount?: boolean
  readonly needProcess?: boolean
  readonly needRebaseArguments?: boolean
  readonly formatData?: (process: any) => any
  readonly resultKey?: string
}
