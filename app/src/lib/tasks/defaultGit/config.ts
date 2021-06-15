import { IDefaultGitOpts } from './model'

export const gitConfigPullRebase: IDefaultGitOpts = {
  args: ['config', 'pull.rebase', 'false'],
  name: 'configPullRebase',
}
