import type { Arguments, CommandBuilder } from 'yargs'

import kafka from '../kafka'
import config, { ConfigKey } from '../config'

export const command: string = 'consumer'
export const desc: string = 'Start consumer tools'
export const builder: CommandBuilder = yargs => yargs.commandDir('consumer-commands', { extensions: ['js', 'ts'] })
export const handler = async (): Promise<void> => {}

export const getConsumerOptions = async (argv: Arguments): Promise<Record<string, string>> => {
  const kafkaAdmin = await kafka.connect(argv)
  const { groups } = await kafkaAdmin.listGroups()
  const consumerGroupIds = groups.map(group => group.groupId)

  const groupId = await config.get({ configKey: ConfigKey.ConsumerGroupId, consumerGroupIds, argv })

  const offsetsByTopic = await kafkaAdmin.fetchOffsets({ groupId })
  const topics = offsetsByTopic.map(topicOffsets => topicOffsets.topic)

  let selectedTopic = topics[0]
  if (topics.length > 1) {
    selectedTopic = await config.get({ configKey: ConfigKey.Topic, topics, argv })
  }

  return { groupId, topic: selectedTopic }
}
