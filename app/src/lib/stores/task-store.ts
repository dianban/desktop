import { BaseStore } from './base-store'
import { AccountsStore } from './accounts-store'
import { RepositoryStateCache } from './repository-state-cache'
import { StatsStore } from '../stats'
import { Account } from '../../models/account'
import { Repository } from '../../models/repository'
import {
  ActionType,
  IActionArgs,
  IActionItem,
  RuleType,
  testTask,
} from '../tasks'
import { GitStoreCache } from './git-store-cache'
import { IDefaultGitOpts } from '../tasks/defaultGit/model'
import { IGitAccount } from '../../models/git-account'
import { git, gitNetworkArguments, gitRebaseArguments } from '../git'
import { getAccountForRepository } from '../get-account-for-repository'
import { getGenericHostname, getGenericUsername } from '../generic-git-auth'
import { executionOptionsWithProgress, GitProgressParser } from '../progress'

export class TaskStore extends BaseStore {
  private accounts: ReadonlyArray<Account> = []

  public constructor(
    accountsStore: AccountsStore,
    public repositoryStateCache: RepositoryStateCache,
    public statsStore: StatsStore
  ) {
    super()
    accountsStore.getAll().then(this.onAccountsUpdated)
    accountsStore.onDidUpdate(this.onAccountsUpdated)
  }

  private onAccountsUpdated = (accounts: ReadonlyArray<Account>) => {
    this.accounts = accounts
  }

  // git account
  private async getGitAccount(
    repository: Repository,
    gitStoreCache: GitStoreCache,
    repositoryWithRefreshedGitHubRepository: (
      repository: Repository
    ) => Promise<Repository>
  ): Promise<{ repository: Repository; account: IGitAccount | null }> {
    let updatedRepository = repository
    let account: IGitAccount | null = getAccountForRepository(
      this.accounts,
      updatedRepository
    )

    if (!account) {
      updatedRepository = await repositoryWithRefreshedGitHubRepository(
        repository
      )
      account = getAccountForRepository(this.accounts, updatedRepository)
    }

    if (!account) {
      const gitStore = gitStoreCache.get(repository)
      const remote = gitStore.currentRemote
      if (remote) {
        const hostname = getGenericHostname(remote.url)
        const username = getGenericUsername(hostname)
        if (username != null) {
          account = { login: username, endpoint: hostname }
        }
      }
    }

    if (account instanceof Account) {
      const hasValidToken =
        account.token.length > 0 ? 'has token' : 'empty token'
      log.info(
        `[AppStore.withAuthenticatingUser] account found for repository: ${repository.name} - ${account.login} (${hasValidToken})`
      )
    }
    return { repository, account }
  }

  private async handleDefaultGit<T>(
    repository: Repository,
    gitStoreCache: GitStoreCache,
    repositoryWithRefreshedGitHubRepository: (
      repository: Repository
    ) => Promise<Repository>,
    opts: IDefaultGitOpts,
    allData: any
  ) {
    const {
      args,
      needAccount,
      name,
      needRebaseArguments,
      formatData,
      needProcess,
      successExitCodes,
      resultKey,
    } = opts

    const fullArgs = []
    let gitOptions: { [key: string]: any } = {}
    if (successExitCodes) {
      gitOptions['successExitCodes'] = new Set(successExitCodes)
    }

    if (needAccount) {
      const gitAccount = await this.getGitAccount(
        repository,
        gitStoreCache,
        repositoryWithRefreshedGitHubRepository
      )
      repository = gitAccount.repository
      const networkArguments = await gitNetworkArguments(
        repository,
        gitAccount.account
      )
      fullArgs.push(...networkArguments)
    }

    if (needRebaseArguments) {
      fullArgs.push(...gitRebaseArguments())
    }

    for (const arg of args) {
      if (arg.startsWith('${') && arg.endsWith('}')) {
        const key = arg.slice(2, -1)
        if (allData[key]) {
          fullArgs.push(allData[key])
          continue
        }
      }
      fullArgs.push(arg)
    }

    if (needProcess) {
      gitOptions = await executionOptionsWithProgress(
        { ...gitOptions, trackLFSProgress: true },
        new GitProgressParser([
          {
            title: 'cc',
            weight: 0.5,
          },
        ]),
        progress => {
          console.log(progress)
          // if (progress.kind === 'context') {
          //   if (!progress.text.startsWith('remote: Counting objects')) {
          //     return
          //   }
          // }
          //
          // const description =
          //   progress.kind === 'progress' ? progress.details.text : progress.text
          //
          // const value = progress.percent
        }
      )
      // fullArgs.push('--progress')
    }

    console.log(fullArgs)
    const result = await git(fullArgs, repository.path, name, { ...gitOptions })

    if (resultKey) {
      return {
        [resultKey]: formatData ? formatData(result) : result,
      }
    }
    return null
  }

  public async test(
    repository: Repository,
    gitStoreCache: GitStoreCache,
    repositoryWithRefreshedGitHubRepository: (
      repository: Repository
    ) => Promise<Repository>
  ) {
    console.log(this.accounts)
    const list: { [key: string]: IActionItem } = testTask
    let allData: IActionArgs = {
      repository,
      gitStoreCache,
      repositoryStateCache: this.repositoryStateCache,
      statsStore: this.statsStore,
    }
    let curActionKey = 'start'
    let status: { [key: string]: string } = {}
    while (list[curActionKey]) {
      status[curActionKey] = 'going'
      const curAction = list[curActionKey]
      const next = curAction.next
      let error: Error | null = null
      let data: any = {}
      let success: boolean = true
      console.log(curAction)
      try {
        switch (curAction.type) {
          case ActionType.defaultNode: {
            break
          }
          case ActionType.defaultCheck: {
            const { fn } = curAction
            data = await fn(allData)
            break
          }
          case ActionType.defaultGit: {
            data = await this.handleDefaultGit(
              repository,
              gitStoreCache,
              repositoryWithRefreshedGitHubRepository,
              curAction.opts,
              allData
            )
            console.log(data)
            break
          }
          case ActionType.git: {
            break
          }
        }
        status[curActionKey] = 'success'
      } catch (e) {
        console.log(e.message)
        success = false
        error = e
        status[curActionKey] = 'fail'
      } finally {
        console.log(curAction, success)
        curActionKey = ''
        if (typeof data === 'object') {
          allData = {
            ...allData,
            ...data,
          }
        }
        let flag = false
        for (const item of next) {
          const { ruleValue, ruleType, to } = item
          if (ruleType === undefined) {
            flag = true
            curActionKey = to
          }
          switch (ruleType) {
            case RuleType.all:
              if (!success) {
                status[curActionKey] = 'warning'
              }
              curActionKey = to
              flag = true
              break
            case RuleType.success:
              if (success) {
                curActionKey = to
                flag = true
              }
              break
            case RuleType.equal:
              if (error?.message && error.message === ruleValue) {
                curActionKey = to
                flag = true
              }
              break
            case RuleType.include:
              if (
                error?.message &&
                ruleValue &&
                error.message.includes(ruleValue)
              ) {
                curActionKey = to
                flag = true
              }
              break
            case RuleType.regExp:
              break
          }
          if (flag) {
            break
          }
        }
      }
      console.log(curActionKey)
    }

    console.log(status)
  }
}
