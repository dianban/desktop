import { ActionGitName, IActionGitOpts } from './model'

export const configPullRebase: IActionGitOpts = {
  name: ActionGitName.configPullRebase,
  defaultTitle: 'set pull.rebase=false',
  args: ['config', 'pull.rebase', 'false'],
}
