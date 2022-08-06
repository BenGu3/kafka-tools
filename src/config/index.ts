import { getDotfileConfig, set, unset } from './dotfile'
import {
  ConfigHelpersByKey, DotfileConfigurableKeys, ConfigHelpers,
  Params, GetKafkaHostParams, GetConsumerIdParams, GetTopicParams, GetResetOffsetsOptionParams
} from './helpers'
import { ConfigKey } from './config-key'
import { ResetOffsetOption } from '../commands/consumer-commands/reset-offsets'

async function get(params: GetKafkaHostParams): Promise<string>
async function get(params: GetConsumerIdParams): Promise<string>
async function get(params: GetTopicParams): Promise<string>
async function get(params: GetResetOffsetsOptionParams): Promise<ResetOffsetOption | Date>
async function get(params: Params): Promise<unknown>
async function get(params: Params): Promise<unknown> {
  const { argv, configKey } = params
  const configHelpers = ConfigHelpersByKey[configKey] as ConfigHelpers

  const argvValue = configHelpers.getFromArgv(params)
  if (argvValue)
    return argvValue

  const dotfileValue = configHelpers.isDotfileConfigurable && configHelpers.getFromDotfile(params, getDotfileConfig())
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
  },
  DotfileConfigurableKeys
}

export { ConfigKey }

export type Config = Partial<Record<ConfigKey, string>>
