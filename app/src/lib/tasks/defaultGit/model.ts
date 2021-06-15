export interface IDefaultGitOpts {
  readonly args: string[]
  readonly name: string
  readonly successExitCodes?: number[]
  readonly needAccount?: boolean
  readonly needProcess?: boolean
  readonly needRebaseArguments?: boolean
  readonly formatData?: (process: any) => any
  readonly resultKey?: string
}
