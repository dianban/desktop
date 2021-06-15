import { TipState } from '../../../models/tip'
import { IActionArgs } from '../model'

export function checkCurrentRemote({ repository, gitStoreCache }: IActionArgs) {
  const gitStore = gitStoreCache.get(repository)
  const remote = gitStore.currentRemote

  if (!remote) {
    throw new Error('The repository has no remotes.')
  }
  return {
    currentRemote: remote,
    remoteName: remote.name,
    remoteUrl: remote.url,
  }
}

export function checkTipIsValid({
  repository,
  repositoryStateCache,
}: IActionArgs) {
  const state = repositoryStateCache.get(repository)
  const tip = state.branchesState.tip

  if (tip.kind === TipState.Unborn) {
    throw new Error('The current branch is unborn.')
  }

  if (tip.kind === TipState.Detached) {
    throw new Error('The current repository is in a detached HEAD state.')
  }

  if (tip.kind === TipState.Unknown) {
    throw new Error('The current branch is unknown.')
  }

  return {
    tipBranchName: tip.branch.name,
    tipBranchUpstream: tip.branch.upstream,
  }
}

export function recordPullWith({ repository, gitStoreCache, statsStore }: IActionArgs) {
  const gitStore = gitStoreCache.get(repository)
  if (gitStore.pullWithRebase) {
    statsStore.recordPullWithRebaseEnabled()
  } else {
    statsStore.recordPullWithDefaultSetting()
  }
}
