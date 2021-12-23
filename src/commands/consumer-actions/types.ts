export type ActionHandler = (params: ActionHandlerParams) => Promise<void>

export type ActionHandlerParams = {
  groupId: string
  topic: string
}

