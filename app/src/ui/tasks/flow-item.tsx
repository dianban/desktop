import * as React from 'react'
import {
  BlockHeight,
  BlockWidth,
  IActionOverviewItem,
  MarginRight,
  MarginTop,
} from './model'
import { LineOverviewItem } from './line-overview-item'

interface IProps {
  readonly data: IActionOverviewItem
}

interface IState {}

export class FlowItem extends React.Component<IProps, IState> {
  public render() {
    const { row, col, key, lines } = this.props.data
    const top = row * (BlockHeight + MarginTop)
    const left = col * (BlockWidth + MarginRight)
    const style = {
      left,
      top,
    }

    return (
      <div className="action-overflow-item" style={style}>
        {key}
        {lines.map((line, index) => (
          <LineOverviewItem
            key={`${key}-${index}`}
            line={line}
            startCol={col}
            startRow={row}
          />
        ))}
      </div>
    )
  }
}
