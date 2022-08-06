import inquirer from 'inquirer'
import fuzzy from 'fuzzy'
import { mapValues, pickBy } from 'lodash'
import { Arguments } from 'yargs'

import { Config } from './index'
import { ConfigKey } from './config-key'
import { ResetOffsetOption } from '../commands/consumer-commands/reset-offsets'

const DefaultConfigHelpers: ConfigHelpers = {
  getFromArgv: ({ argv, configKey }) => argv[configKey],
  isDotfileConfigurable: true,
  getFromDotfile: ({ configKey }, dotfile) => dotfile && dotfile[configKey],
  prompt: async () => { throw new Error('no prompt :(') }
}

const PartialConfigHelpersByKey: { [P in Params as P['configKey']]: Partial<ConfigHelpers<P>> } = {
  [ConfigKey.KafkaHost]: {
    prompt: async () => {
      const { kafkaHost } = await inquirer.prompt<{ kafkaHost: string }>({
        name: 'kafkaHost',
        message: 'What is your Kafka host?',
        type: 'input'
      })

      return kafkaHost
    }
  },
  [ConfigKey.ConsumerGroupId]: {
    prompt: async params => {
      const { consumerGroupId } = await inquirer.prompt<{ consumerGroupId: string }>({
        name: 'consumerGroupId',
        message: 'Which consumer?',
        type: 'autocomplete' as any,
        source: ((_answersSoFar: any, input: string) => fuzzy.filter(input ?? '', params.consumerGroupIds).map(result => result.original)) as any
      })

      return consumerGroupId
    }
  },
  [ConfigKey.Topic]: {
    prompt: async params => {
      const { topic } = await inquirer.prompt<{ topic: string }>({
        name: 'topic',
        message: 'Which topic?',
        type: 'list',
        choices: params.topics
      })

      return topic
    }
  },
  [ConfigKey.ResetOffsetsOption]: {
    getFromArgv: params => {
      if (params.argv.earliest) return ResetOffsetOption.Earliest
      if (params.argv.latest) return ResetOffsetOption.Latest
      if (params.argv.timestamp) return new Date(params.argv.timestamp as string | number | Date)

      return undefined
    },
    isDotfileConfigurable: false,
    prompt: async () => {
      const { resetOffsetsOption } = await inquirer.prompt<{ resetOffsetsOption: ResetOffsetOption }>({
        name: 'resetOffsetsOption',
        message: 'Reset to earliest, latest, or a specific time?',
        type: 'list',
        choices: Object.values(ResetOffsetOption)
      })

      if (resetOffsetsOption !== ResetOffsetOption.Timestamp)
        return resetOffsetsOption

      const { resetTimestamp } = await inquirer.prompt<{ resetTimestamp: Date }>({
        name: 'resetTimestamp',
        message: 'Reset offsets to when?',
        type: 'date' as any
      })

      return resetTimestamp
    }
  }
}

export const ConfigHelpersByKey = mapValues(PartialConfigHelpersByKey, helpers => ({ ...DefaultConfigHelpers, ...helpers }))
export const DotfileConfigurableKeys = Object.keys(pickBy(ConfigHelpersByKey, helpers => helpers.isDotfileConfigurable))

export type ConfigHelpers<ParamsType = Params> = {
  getFromArgv: (params: ParamsType) => unknown
  isDotfileConfigurable: boolean
  getFromDotfile: (params: ParamsType, dotfile: Config | null) => unknown
  prompt: (params: ParamsType) => Promise<unknown>
}

export type Params =
  | GetKafkaHostParams
  | GetConsumerIdParams
  | GetTopicParams
  | GetResetOffsetsOptionParams

type BaseParams = {
  configKey: ConfigKey
  argv: Arguments
}

export type GetKafkaHostParams = BaseParams & {
  configKey: ConfigKey.KafkaHost
}

export type GetConsumerIdParams = BaseParams & {
  configKey: ConfigKey.ConsumerGroupId
  consumerGroupIds: string[]
}

export type GetTopicParams = BaseParams & {
  configKey: ConfigKey.Topic
  topics: string[]
}

export type GetResetOffsetsOptionParams = BaseParams & {
  configKey: ConfigKey.ResetOffsetsOption
}
