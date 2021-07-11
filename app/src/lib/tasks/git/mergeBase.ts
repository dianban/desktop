import { ActionGitName, IActionGitOpts } from './model'

export const mergeBaseBranchUpstream: IActionGitOpts = {
  name: ActionGitName.mergeBaseBranchUpstream,
  defaultTitle: 'merge-base',
  args: ['merge-base', '${tipBranchName}', '${tipBranchUpstream}'],
  successExitCodes: [0, 1, 128],
  needAccount: false,
  formatData: (process: any) => {
    if (process.exitCode === 1 || process.exitCode === 128) {
      return null
    }
    return process.stdout.trim()
  },
  resultKey: 'mergeBase',
}
