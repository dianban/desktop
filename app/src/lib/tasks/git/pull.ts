import { ActionGitName, IActionGitOpts } from './model'

export const pullCurrentRemote: IActionGitOpts = {
  name: ActionGitName.pullCurrentRemote,
  defaultTitle: '更新',
  startTips: 'start pull',
  endTips: 'end pull',
  args: ['pull', '--recurse-submodules', '--progress', '${currentRemoteName}'],
  successExitCodes: [0, 1, 128],
  needAccount: true,
  needProcess: true,
  needRebaseArguments: true,
  formatData: (process: any) => {
    if (process.exitCode === 1 || process.exitCode === 128) {
      return null
    }
    return process.stdout.trim()
  },
}
