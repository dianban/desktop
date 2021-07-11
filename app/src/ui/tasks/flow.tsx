import * as React from 'react'
import { FlowItem } from './flow-item'
import { IActionOverviewItem } from './model'
import {
  ActionStatusType,
  getTaskPath,
  ITaskCacheItem,
  ITaskQueueItem,
  taskDataToOverviewData,
} from '../../lib/tasks'

interface IProps {
  readonly taskData: ITaskQueueItem | null
  readonly taskCache: ITaskCacheItem | null
}

interface IState {
  readonly list: { [key: string]: IActionOverviewItem } | null
}

export class Flow extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props)
    this.state = {
      list: {},
    }
  }

  public componentDidMount(): void {
    this.setList()
  }

  public componentDidUpdate(
    prevProps: Readonly<IProps>,
    prevState: Readonly<IState>,
    snapshot?: any
  ): void {
    if (prevProps.taskData?.id !== this.props.taskData?.id) {
      this.setList()
    }
  }

  private setList = () => {
    const { taskData } = this.props
    if (taskData === null) {
      this.setState({ list: null })
      return
    }
    const list = taskDataToOverviewData(taskData.actions)
    console.log(list)
    this.setState({ list })
  }

  public render() {
    const { list } = this.state
    const { taskCache } = this.props
    const executionPath = taskCache?.executionPath || []
    const executionStatus = taskCache?.executionStatus || {}

    const paths = getTaskPath(list, executionPath)

    return (
      <div className="task-overview">
        {list
          ? Object.keys(list).map(key => {
              const status = executionStatus[key] || ActionStatusType.waiting
              return (
                <FlowItem
                  key={key}
                  data={list[key]}
                  status={status}
                  paths={paths}
                />
              )
            })
          : null}
      </div>
    )
  }
}
