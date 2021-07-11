import { IActionArgs } from '../model'
import { ActionGitStoreName, IActionGitStoreOpts } from './model'

export function fn({ repository, gitStoreCache, statsStore }: IActionArgs) {
  const gitStore = gitStoreCache.get(repository)
  if (gitStore.pullWithRebase) {
    statsStore.recordPullWithRebaseEnabled()
  } else {
    statsStore.recordPullWithDefaultSetting()
  }
}

export const recordPullWith: IActionGitStoreOpts = {
  name: ActionGitStoreName.recordPullWith,
  defaultTitle: 'record pull',
  fn: fn,
}
