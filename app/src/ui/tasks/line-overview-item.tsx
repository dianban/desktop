import * as React from 'react'
import {
  BlockHeight,
  BlockWidth,
  ILineItem,
  IPointItem,
  ITaskPathItem,
  MarginRight,
  MarginTop,
  StrokeWidth,
  TriangleHeight,
} from './model'

interface IProps {
  readonly startRow: number
  readonly startCol: number
  readonly line: ILineItem
  readonly paths: ReadonlyArray<ITaskPathItem>
}

interface IState {}

export class LineOverviewItem extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props)
  }

  public render() {
    const { startRow, startCol, line, paths } = this.props
    const active = paths.some(
      item =>
        item.startRow === startRow &&
        item.startCol === startCol &&
        line.row === item.row &&
        line.col === item.col
    )

    const { row, col } = line
    let points: Array<IPointItem> = []
    let width: number = 0
    let height: number = 0
    let left: number = 0
    let top: number = 0
    const itemWidth = BlockWidth + MarginRight
    const itemHeight = BlockHeight + MarginTop

    let flag: boolean = true

    if (col === startCol + 1) {
      const moreHeight = (row - startRow) * itemHeight
      flag = false
      left = BlockWidth
      top = BlockHeight / 2
      points.push(
        {
          x: 0,
          y: 0,
        },
        {
          x: MarginRight / 2,
          y: 0,
        },
        {
          x: MarginRight / 2,
          y: moreHeight,
        },
        {
          x: MarginRight,
          y: moreHeight,
        }
      )
    } else if (col <= startCol) {
      const rowPositive = row > startRow ? 1 : -1
      const colPositive = col > startCol ? 1 : -1
      flag = false
      left = BlockWidth / 2
      top = BlockHeight
      points.push(
        {
          x: 0,
          y: 0,
        },
        {
          x: 0,
          y: MarginTop / 2,
        },
        {
          x: (col - startCol) * itemWidth + (itemWidth * colPositive) / 2,
          y: MarginTop / 2,
        },
        {
          x: (col - startCol) * itemWidth + (itemWidth * colPositive) / 2,
          y:
            MarginTop / 2 +
            (row - startRow) * itemHeight +
            (itemHeight / 2 - 10) * rowPositive,
        },
        {
          x:
            (col - startCol) * itemWidth +
            (itemWidth * colPositive) / 2 +
            MarginRight / 2,
          y:
            MarginTop / 2 +
            (row - startRow) * itemHeight +
            (itemHeight / 2 - 10) * rowPositive,
        }
      )
    }
    if (flag) {
      console.log(startRow, startCol, row, col)
    }

    let lastX: number | null = null
    let lastY: number | null = null
    let minX = 0
    let minY = 0
    points = points.filter(p => {
      minX = Math.min(minX, p.x)
      minY = Math.min(minY, p.y)
      const flag =
        lastX === null || lastY === null || p.x !== lastX || p.y !== lastY
      lastX = p.x
      lastY = p.y
      return flag
    })

    points = points.map(p => {
      width = Math.max(width, p.x - minX)
      height = Math.max(height, p.y - minY)
      return {
        x: p.x - minX + StrokeWidth + TriangleHeight,
        y: p.y - minY + StrokeWidth + TriangleHeight,
      }
    })

    width += StrokeWidth * 2 + TriangleHeight * 2
    height += StrokeWidth * 2 + TriangleHeight * 2
    left = left + minX - StrokeWidth - TriangleHeight - 1
    top = top + minY - StrokeWidth - TriangleHeight - 1
    const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')
    const style = {
      left,
      top,
    }

    // 终点画三角形箭头
    const { x: aX, y: aY } = points[points.length - 1]
    const { x: bX, y: bY } = points[points.length - 2]
    let x1 = 0
    let x2 = 0
    let y1 = 0
    let y2 = 0
    if (aX === bX) {
      x1 = aX + TriangleHeight
      x2 = aX - TriangleHeight
      y1 = y2 = aY + (aY < bY ? 5 : -5)
    } else if (aY === bY) {
      y1 = aY + TriangleHeight
      y2 = aY - TriangleHeight
      x1 = x2 = aX + (aX < bX ? 5 : -5)
    }
    const triangle = [
      { x: aX, y: aY },
      {
        x: x1,
        y: y1,
      },
      {
        x: x2,
        y: y2,
      },
    ]
    const triangleStr = triangle.map(p => `${p.x},${p.y}`).join(' ')

    return (
      <div className="line-overview-item" style={style}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
          <polyline
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke={active ? '#0366d6' : '#999'}
            strokeWidth={StrokeWidth}
            points={pointsStr}
          />
          <polyline
            xmlns="http://www.w3.org/2000/svg"
            fill={active ? '#0366d6' : '#999'}
            points={triangleStr}
          />
        </svg>
      </div>
    )
  }
}
