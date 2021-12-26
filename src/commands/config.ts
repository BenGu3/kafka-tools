import type { Arguments, CommandBuilder } from 'yargs'

import * as config from '../config'
import { ConfigKey } from '../config'

type SetPositionals = {
  key: string
  value: string
}

type UnsetPositionals = {
  key: string
}

export const command: string = 'config'
export const desc: string = 'Set config'
export const builder: CommandBuilder = yargs =>
  yargs
    .command({
      command: 'set <key> <value>',
      describe: 'key and value to set in config',
      builder: yargs =>
        yargs
          .positional('key', { type: 'string', choices: Object.values(config.ConfigKey), demandOption: true })
          .positional('value', { type: 'string', demandOption: true }),
      handler: setHandler
    })
    .command({
      command: 'unset <key>',
      describe: 'key to unset in config',
      builder: yargs => yargs.positional('key', { type: 'string', choices: Object.values(config.ConfigKey), demandOption: true }),
      handler: unsetHandler
    })


export const setHandler = (params: Arguments<SetPositionals>) => {
  const { key, value } = params
  config.set({ key: key as ConfigKey, value })
}

export const unsetHandler = (params: Arguments<UnsetPositionals>) => {
  config.unset(params.key as ConfigKey)
}

export const handler = async (): Promise<void> => {
  console.log(JSON.stringify(config.getConfig(), null, 2))
}
