import { IActionArgs } from '../model'
import { IActionOpts } from '../common'

export enum ActionGitStoreName {
  currentRemote,
  tipIsValid,
  recordPullWith,
}

export interface IActionGitStoreOpts extends IActionOpts {
  readonly fn: (args: IActionArgs) => any
}
