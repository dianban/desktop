import { IDefaultGitOpts } from './model'

export const mergeBaseBranchUpstream: IDefaultGitOpts = {
  args: ['merge-base', '${tipBranchName}', '${tipBranchUpstream}'],
  successExitCodes: [0, 1, 128],
  name: 'mergeBaseBranchUpstream',
  needAccount: false,
  formatData: (process: any) => {
    if (process.exitCode === 1 || process.exitCode === 128) {
      return null
    }
    return process.stdout.trim()
  },
  resultKey: 'mergeBase',
}
