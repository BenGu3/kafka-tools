import { getDotfileConfig, set, unset } from './dotfile'
import { ConfigHelpers, ConfigHelpersByKey, Params } from './helpers'
import { ConfigKey } from './config-key'

async function get(params: Params): Promise<unknown> {
  const { argv, configKey } = params
  const configHelpers = ConfigHelpersByKey[configKey] as ConfigHelpers

  const argvValue = configHelpers.getFromArgv(params)
  if (argvValue)
    return argvValue

  const dotfileValue = configHelpers.getFromDotfile(params, getDotfileConfig())
  if (dotfileValue)
    return dotfileValue

  if (argv.interactive)
    return configHelpers.prompt(params)

  throw new Error(`Missing '${configKey}'. kafka-tools must be run in interactive mode or '${configKey}' must be set in command line arguments or config.`)
}

export default {
  get,
  dotfile: {
    getConfig: getDotfileConfig,
    set,
    unset
  }
}

export type Config = Partial<Record<ConfigKey, string>>
