import { BaseStore } from './base-store'
import { AccountsStore } from './accounts-store'
import { RepositoryStateCache } from './repository-state-cache'
import { Account } from '../../models/account'
import { Repository } from '../../models/repository'
import {
  ActionStatusType,
  ActionType,
  getTaskID,
  IActionArgs,
  ITaskItem,
  ITasksState,
  RuleType,
} from '../tasks'
import { GitStoreCache } from './git-store-cache'
import { IGitAccount } from '../../models/git-account'
import { git, gitNetworkArguments, gitRebaseArguments } from '../git'
import { getAccountForRepository } from '../get-account-for-repository'
import { getGenericHostname, getGenericUsername } from '../generic-git-auth'
import { executionOptionsWithProgress, GitProgressParser } from '../progress'
import { withTrampolineEnvForRemoteOperation } from '../trampoline/trampoline-environment'
import { merge } from '../merge'
import { IActionGitOpts } from '../tasks/git/model'

export class TaskStore extends BaseStore {
  private accounts: ReadonlyArray<Account> = []

  public constructor(
    accountsStore: AccountsStore,
    public repositoryStateCache: RepositoryStateCache // public statsStore: StatsStore
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
    opts: IActionGitOpts,
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

    const fullArgs: string[] = []
    let account: IGitAccount | null = null
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
      account = gitAccount.account
      const networkArguments = await gitNetworkArguments(repository, account)
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
    }

    console.log(fullArgs)
    console.log(gitOptions)
    // const result = await git(fullArgs, repository.path, name, { ...gitOptions })
    const result = await withTrampolineEnvForRemoteOperation(
      account,
      allData.currentRemateUrl,
      env => {
        return git(fullArgs, repository.path, name.toString(), {
          ...gitOptions,
          env: merge(gitOptions.env, env),
        })
      }
    )
    console.log(22222, result)

    if (resultKey) {
      return {
        [resultKey]: formatData ? formatData(result) : result,
      }
    }
    return null
  }

  public updateTasksState<K extends keyof ITasksState>(
    repository: Repository,
    data: Pick<ITasksState, K>
  ) {
    this.repositoryStateCache.updateTasksState(repository, () => data)
    this.emitUpdate()
  }

  public async test(
    repository: Repository,
    task: ITaskItem,
    gitStoreCache: GitStoreCache,
    repositoryWithRefreshedGitHubRepository: (
      repository: Repository
    ) => Promise<Repository>
  ) {
    const { taskList } = this.repositoryStateCache.get(repository).tasksState
    const id = getTaskID()
    this.updateTasksState(repository, {
      taskList: taskList.concat([{ ...task, id }]),
    })
    this.handleTaskList(
      repository,
      gitStoreCache,
      repositoryWithRefreshedGitHubRepository
    )
  }

  private async handleTaskList(
    repository: Repository,
    gitStoreCache: GitStoreCache,
    repositoryWithRefreshedGitHubRepository: (
      repository: Repository
    ) => Promise<Repository>
  ) {
    const { taskList } = this.repositoryStateCache.get(repository).tasksState
    if (taskList.length === 0) {
      return
    }
    const { name, actions, id } = taskList[0]
    this.updateTasksState(repository, {
      currentTaskKey: id,
    })

    console.log('task start', name, id)
    let allData: IActionArgs = {
      repository,
      gitStoreCache,
      repositoryStateCache: this.repositoryStateCache,
      // statsStore: this.statsStore,
    }

    let curActionKey = 'start'
    while (actions[curActionKey]) {
      console.log('action start', curActionKey)
      this.updateActionPath(repository, id, curActionKey)
      this.updateActionStatus(
        repository,
        id,
        curActionKey,
        ActionStatusType.going
      )

      const curAction = actions[curActionKey]
      const next = curAction.next
      let error: Error | null = null
      let data: any = {}
      let success: boolean = true
      try {
        switch (curAction.type) {
          case ActionType.defaultNode: {
            break
          }
          case ActionType.gitStore: {
            const { fn } = curAction.opts
            data = await fn(allData)
            break
          }
          case ActionType.git: {
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
        }
        this.updateActionStatus(
          repository,
          id,
          curActionKey,
          ActionStatusType.success
        )
      } catch (e) {
        console.log(e.message)
        success = false
        error = e
        this.updateActionStatus(
          repository,
          id,
          curActionKey,
          ActionStatusType.success
        )
      } finally {
        console.log('action end', curActionKey, curAction, success)
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
                this.updateActionStatus(
                  repository,
                  id,
                  curActionKey,
                  ActionStatusType.warning
                )
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
    }
    console.log(1111111111)
    this.removeTask(repository, id)
  }

  private updateActionPath = (
    repository: Repository,
    id: number,
    actionKey: string
  ) => {
    const { tasksCache } = this.repositoryStateCache.get(repository).tasksState
    if (!tasksCache[id]) {
      tasksCache[id] = {
        executionPath: [],
        executionStatus: {},
      }
    }
    let executionPath = tasksCache[id].executionPath.slice()
    let executionStatus = Object.assign({}, tasksCache[id].executionStatus)
    const index = executionPath.findIndex(i => i === actionKey)

    if (index > -1) {
      for (let i = index; i++; i < executionPath.length) {
        executionStatus[executionPath[i]] = ActionStatusType.waiting
      }
      executionPath = executionPath.slice(0, index + 1)
    } else {
      executionPath.push(actionKey)
    }
    tasksCache[id] = {
      executionPath,
      executionStatus,
    }

    this.updateTasksState(repository, {
      tasksCache,
    })
  }

  private updateActionStatus(
    repository: Repository,
    id: number,
    actionKey: string,
    status: ActionStatusType
  ) {
    const { tasksCache } = this.repositoryStateCache.get(repository).tasksState
    if (!tasksCache[id]) {
      tasksCache[id] = {
        executionPath: [],
        executionStatus: {},
      }
    }
    tasksCache[id].executionStatus[actionKey] = status

    this.updateTasksState(repository, {
      tasksCache,
    })
  }

  private removeTask(repository: Repository, id: number) {
    const taskList = this.repositoryStateCache
      .get(repository)
      .tasksState.taskList.slice()
    const index = taskList.findIndex(item => item.id === id)
    if (index > -1) {
      taskList.splice(index, 1)
      this.updateTasksState(repository, {
        taskList,
      })
    }
  }
}
