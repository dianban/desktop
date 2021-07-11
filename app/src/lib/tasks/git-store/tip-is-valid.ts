import { IActionArgs } from '../model'
import { TipState } from '../../../models/tip'
import { ActionGitStoreName, IActionGitStoreOpts } from './model'

function fn({ repository, repositoryStateCache }: IActionArgs) {
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

export const tipIsValid: IActionGitStoreOpts = {
  name: ActionGitStoreName.tipIsValid,
  defaultTitle: '检查当前分支状态',
  fn: fn,
}
