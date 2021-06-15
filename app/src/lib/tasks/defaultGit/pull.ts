import { IDefaultGitOpts } from './model'

export const defaultPull: IDefaultGitOpts = {
  args: ['pull', '--recurse-submodules', '--progress', '${remoteName}'],
  successExitCodes: [0, 1, 128],
  name: 'defaultPull',
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
