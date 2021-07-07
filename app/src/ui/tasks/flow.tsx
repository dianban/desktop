import * as React from 'react'
import { FlowItem } from './flow-item'
import { IActionOverviewItem } from './model'

interface IProps {}

interface IState {
  readonly list: { [key: string]: IActionOverviewItem }
}

export class Flow extends React.Component<IProps, IState> {
  private data = {
    start: {
      next: [
        {
          to: '2',
        },
      ],
    },
    '2': {
      next: [
        {
          to: '3',
        },
      ],
    },
    '3': {
      next: [
        {
          to: '3',
        },
        {
          to: '4',
        },
        {
          to: '2',
        },
      ],
    },
    '4': {
      next: [
        {
          to: '5',
        },
        {
          to: '7',
        },
      ],
    },
    '5': {
      next: [
        {
          to: '8',
        },
      ],
    },
    '7': {
      next: [],
    },
    '8': {
      next: [],
    },
  }

  public constructor(props: IProps) {
    super(props)
    this.state = {
      list: {},
    }
  }

  public componentDidMount(): void {
    const list = this.dataToArray(this.data)
    console.log(list)
    this.setState({ list })
  }

  private dataToArray(data: any) {
    const res: any = {}
    let curCol = [
      {
        key: 'start',
        parentKey: '',
      },
    ]
    let row = 0
    let col = 0
    let i = 0
    while (curCol.length && i < 10) {
      i++
      row = 0
      const nextCol = []
      for (const item of curCol) {
        const key = item.key
        const parentKey = item.parentKey
        let flag = true
        if (!res[key]) {
          res[key] = {
            key,
            col,
            row,
            lines: [],
          }
          flag = false
          if (res[parentKey]) {
            res[parentKey].lines.push({
              row,
              col,
            })
          }
        } else {
          if (res[parentKey]) {
            const { row, col } = res[key]
            res[parentKey].lines.push({
              row,
              col,
            })
          }
        }
        if (flag) {
          continue
        }
        const optItem = data[key]
        if (!optItem) {
          console.log('error', key)
        }
        const next = optItem.next
        for (const nextItem of next) {
          nextCol.push({
            key: nextItem.to,
            parentKey: key,
          })
          row++
        }
      }
      curCol = nextCol
      col++
    }
    return res
  }

  public render() {
    const keys = Object.keys(this.state.list)
    return (
      <div className="task-overview">
        {keys.map(key => (
          <FlowItem key={key} data={this.state.list[key]} />
        ))}
      </div>
    )
  }
}
