import type { CommandBuilder } from 'yargs'
import inquirer from 'inquirer'
import fuzzy from 'fuzzy'

import getKafkaAdmin from '../get-kafka-admin'

export const command: string = 'consumer'
export const desc: string = 'Start consumer tools'
export const builder: CommandBuilder = yargs => yargs.commandDir('consumer-commands', { extensions: ['js', 'ts'] })
export const handler = async (): Promise<void> => {}

export const getConsumerOptions = async (): Promise<Record<string, string>> => {
  const kafkaAdmin = await getKafkaAdmin()
  const { groups } = await kafkaAdmin.listGroups()
  const groupIds = groups.map(group => group.groupId)

  const { groupId } = await inquirer.prompt<{ groupId: string }>({
    name: 'groupId',
    message: 'Which consumer?',
    type: 'autocomplete' as any,
    source: ((_answersSoFar: any, input: string) => fuzzy.filter(input ?? '', groupIds).map(result => result.original)) as any
  })

  const offsetsByTopic = await kafkaAdmin.fetchOffsets({ groupId })
  const topics = offsetsByTopic.map(topicOffsets => topicOffsets.topic)

  let selectedTopic = topics[0]
  if (topics.length > 1) {
    const { topic } = await inquirer.prompt<{ topic: string }>({
      name: 'topic',
      message: 'Which topic?',
      type: 'list',
      choices: topics
    })

    selectedTopic = topic
  }

  return { groupId, topic: selectedTopic }
}
