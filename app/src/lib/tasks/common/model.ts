import { ActionGitStoreName } from '../git-store/model'
import { ActionGitName } from '../git/model'
import { ActionNodeName } from '../node'

export interface IActionOpts {
  readonly name: ActionGitStoreName | ActionGitName | ActionNodeName
  readonly defaultTitle: string
  readonly startTips?: string
  readonly endTips?: string
}
