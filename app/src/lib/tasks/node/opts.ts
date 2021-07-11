import { ActionNodeName, IActionNodeOpts } from './model'

export const startNode: IActionNodeOpts = {
  name: ActionNodeName.start,
  defaultTitle: '开始',
}

export const endNode: IActionNodeOpts = {
  name: ActionNodeName.end,
  defaultTitle: '结束',
}
