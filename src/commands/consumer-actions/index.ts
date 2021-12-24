import { ActionHandler } from './types'
import fetchOffsets from './fetch-offsets'
import resetOffsets from './reset-offsets'

export enum Action {
  FetchOffsets = 'Fetch offsets',
  ResetOffsets = 'Reset offsets'
}

export const ActionHandlers: Record<Action, ActionHandler> = {
  [Action.FetchOffsets]: fetchOffsets,
  [Action.ResetOffsets]: resetOffsets
}
