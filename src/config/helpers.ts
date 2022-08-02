import inquirer from 'inquirer'
import fuzzy from 'fuzzy'
import { mapValues } from 'lodash'

import { ConfigKey } from './config-key'
import { Config } from './index'

const DefaultConfigHelpers: ConfigHelpers = {
  getFromArgv: ({ argv, configKey }) => argv[configKey],
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
  }
}

export const ConfigHelpersByKey = mapValues(PartialConfigHelpersByKey, helpers => ({ ...DefaultConfigHelpers, ...helpers }))

export type ConfigHelpers<ParamsType = Params> = {
  getFromArgv: (params: ParamsType) => unknown
  getFromDotfile: (params: ParamsType, dotfile: Config | null) => unknown
  prompt: (params: ParamsType) => Promise<unknown>
}

export type Params =
  | GetKafkaHostParams
  | GetConsumerIdParams
  | GetTopicParams

type BaseParams = {
  configKey: ConfigKey
  argv: { interactive: boolean } & Record<string, any>
}

type GetKafkaHostParams = BaseParams & {
  configKey: ConfigKey.KafkaHost
}

type GetConsumerIdParams = BaseParams & {
  configKey: ConfigKey.ConsumerGroupId
  consumerGroupIds: string[]
}

type GetTopicParams = BaseParams & {
  configKey: ConfigKey.Topic
  topics: string[]
}
