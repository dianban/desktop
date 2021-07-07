export const BlockWidth = 150
export const BlockHeight = 50
export const MarginRight = 30
export const MarginTop = 20
export const strokeWidth = 1

export interface ILineItem {
  readonly row: number
  readonly col: number
}

export interface IActionOverviewItem {
  readonly key: string
  readonly col: number
  readonly row: number
  readonly lines: ReadonlyArray<ILineItem>
}

export interface IPointItem {
  readonly x: number
  readonly y: number
}
