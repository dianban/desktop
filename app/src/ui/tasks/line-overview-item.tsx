import * as React from 'react'
import {
  BlockHeight,
  BlockWidth,
  ILineItem,
  IPointItem,
  MarginRight,
  MarginTop,
  strokeWidth,
} from './model'

interface IProps {
  readonly startRow: number
  readonly startCol: number
  readonly line: ILineItem
}

interface IState {}

export class LineOverviewItem extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props)
  }

  public render() {
    const { startRow, startCol, line } = this.props
    const { row, col } = line
    let points: Array<IPointItem> = []
    let width: number = 0
    let height: number = 0
    let left: number = 0
    let top: number = 0
    let flag: boolean = true
    if (row >= startRow) {
      if (col === startCol + 1) {
        const moreHeight = (row - startRow) * (BlockHeight + MarginTop)
        flag = false
        width = MarginRight
        height = strokeWidth + 2 + moreHeight
        left = BlockWidth - 1
        top = (BlockHeight - strokeWidth) / 2 - 1
        points.push(
          {
            x: 0,
            y: strokeWidth,
          },
          {
            x: MarginRight / 2,
            y: strokeWidth,
          },
          {
            x: MarginRight / 2,
            y: strokeWidth + moreHeight,
          },
          {
            x: MarginRight,
            y: strokeWidth + moreHeight,
          }
        )
      } else if (col <= startCol) {
        flag = false
        const moreHeight = (row - startRow) * (BlockHeight + MarginTop)
        const moreWidth = (startCol - col) * (BlockWidth + MarginRight)
        width = BlockWidth / 2 + 10 + moreWidth + strokeWidth * 2
        height = MarginTop / 2 + moreHeight + strokeWidth * 2
        left = BlockWidth / 2 - strokeWidth
        top = BlockHeight - strokeWidth
        points.push(
          {
            x: 0 - 1,
            y: 0 - 1,
          },
          {
            x: 0 - 1,
            y: MarginTop / 2 - 1,
          },
          {
            x: 0 - width,
            y: MarginTop / 2 - 1,
          }
        )
      }
    }
    if (flag) {
      console.log(startRow, startCol, row, col)
    }

    let lastX: number | null = null
    let lastY: number | null = null
    let minX = 0
    let minY = 0
    console.log(1, points)
    points = points.filter(p => {
      minX = Math.min(minX, p.x)
      minY = Math.min(minY, p.y)
      const flag =
        lastX === null || lastY === null || p.x !== lastX || p.y !== lastY
      lastX = p.x
      lastY = p.y
      return flag
    })
    console.log(2, points)

    console.log(minX, minY)
    left = left + minX
    top = top + minY
    points = points.map(p => {
      return {
        x: p.x - minX,
        y: p.y - minY,
      }
    })

    const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')
    const style = {
      left,
      top,
    }

    return (
      <div className="line-overview-item" style={style}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
          <polyline
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="black"
            strokeWidth={strokeWidth}
            points={pointsStr}
          />
        </svg>
      </div>
    )
  }
}
