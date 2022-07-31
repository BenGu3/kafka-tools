import { getDotfileConfig, set, unset } from './dotfile'
import { ConfigHelpers, ConfigHelpersByKey, Params } from './helpers'
import { ConfigKey } from './config-key'

async function get(params: Params): Promise<any> {
  const { argv, configKey } = params
  const dotfile = getDotfileConfig()

  if (argv[configKey])
    return argv[configKey]

  if (dotfile?.[configKey])
    return dotfile[configKey]

  const configHelpers = ConfigHelpersByKey[configKey] as ConfigHelpers

  if (argv.interactive && configHelpers.prompt)
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
