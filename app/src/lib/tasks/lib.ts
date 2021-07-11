import { TaskActions } from './model'
import { IActionOverviewItem, ITaskPathItem } from '../../ui/tasks/model'

let id = 0

export function getTaskID() {
  id += 1
  return id
}

export function taskDataToOverviewData(
  data: TaskActions
): { [key: string]: IActionOverviewItem } {
  const res: { [key: string]: IActionOverviewItem } = {}
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
      const optItem = data[key]
      let flag = true
      if (!res[key]) {
        res[key] = {
          key,
          col,
          row,
          lines: [],
          actionData: optItem,
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

export function getTaskPath(
  data: { [key: string]: IActionOverviewItem } | null,
  executionPath: ReadonlyArray<string>
): Array<ITaskPathItem> {
  if (data === null) {
    return []
  }

  let res: Array<ITaskPathItem> = []
  for (let i = 1; i < executionPath.length; i++) {
    const start = data[executionPath[i - 1]]
    const cur = data[executionPath[i]]
    res.push({
      startCol: start.col,
      startRow: start.row,
      col: cur.col,
      row: cur.row,
    })
  }

  return res
}
