import { IRemote } from '../../models/remote'

export interface TaskDataPool {
  currentRemote: IRemote | null
  remoteName: string
  remoteUrl: string
}
