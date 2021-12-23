import { ActionHandler } from './types'
import fetchOffsets from './fetch-offsets'

export enum Action {
  FetchOffsets = 'Fetch offsets'
}

export const ActionHandlers: Record<Action, ActionHandler> = {
  [Action.FetchOffsets]: fetchOffsets
}
