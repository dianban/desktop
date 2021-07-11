import * as React from 'react'
import classNames from 'classnames'
import {
  BlockHeight,
  BlockWidth,
  IActionOverviewItem,
  ITaskPathItem,
  MarginRight,
  MarginTop,
} from './model'
import { LineOverviewItem } from './line-overview-item'
import { ActionStatusType } from '../../lib/tasks'
import { Octicon, OcticonSymbol } from '../octicons'

interface IProps {
  readonly data: IActionOverviewItem
  readonly status: ActionStatusType
  readonly paths: ReadonlyArray<ITaskPathItem>
}

interface IState {}

export class FlowItem extends React.Component<IProps, IState> {
  public renderIcon() {
    const { status } = this.props
    switch (status) {
      case ActionStatusType.waiting:
        return <Octicon symbol={OcticonSymbol.dash} />
      case ActionStatusType.going:
        return <Octicon symbol={OcticonSymbol.sync} className="spin" />
      case ActionStatusType.success:
        return <Octicon symbol={OcticonSymbol.checkCircle} />
      case ActionStatusType.fail:
        return <Octicon symbol={OcticonSymbol.xCircle} />
      case ActionStatusType.warning:
        return <Octicon symbol={OcticonSymbol.stop} />
    }
  }
  public render() {
    const { status, data, paths } = this.props
    const { row, col, key, lines, actionData } = data
    const top = row * (BlockHeight + MarginTop)
    const left = col * (BlockWidth + MarginRight)
    const style = {
      left,
      top,
    }

    const { defaultTitle } = actionData.opts

    return (
      <div
        className={classNames('action-overflow-item', `action-item-${status}`)}
        style={style}
      >
        {this.renderIcon()}
        {defaultTitle}
        {lines.map((line, index) => (
          <LineOverviewItem
            key={`${key}-${index}`}
            line={line}
            startCol={col}
            startRow={row}
            paths={paths}
          />
        ))}
      </div>
    )
  }
}
