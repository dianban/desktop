import { IActionItem } from '../../lib/tasks'

export const BlockWidth = 150
export const BlockHeight = 50
export const MarginRight = 30
export const MarginTop = 20
export const StrokeWidth = 1
export const TriangleHeight = 3

export interface ILineItem {
  readonly row: number
  readonly col: number
}

export interface IActionOverviewItem {
  readonly key: string
  readonly col: number
  readonly row: number
  readonly lines: Array<ILineItem>
  readonly actionData: IActionItem
}

export interface IPointItem {
  readonly x: number
  readonly y: number
}

export interface ITaskPathItem {
  readonly startRow: number
  readonly startCol: number
  readonly row: number
  readonly col: number
}
