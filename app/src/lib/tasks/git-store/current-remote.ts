import { IActionArgs } from '../model'
import { ActionGitStoreName, IActionGitStoreOpts } from './model'

function fn({ repository, gitStoreCache }: IActionArgs) {
  const gitStore = gitStoreCache.get(repository)
  const remote = gitStore.currentRemote

  if (!remote) {
    throw new Error('The repository has no remotes.')
  }
  return {
    currentRemote: remote,
    currentRemoteName: remote.name,
    currentRemoteUrl: remote.url,
  }
}

export const currentRemote: IActionGitStoreOpts = {
  name: ActionGitStoreName.currentRemote,
  defaultTitle: '获取remote',
  fn: fn,
}
