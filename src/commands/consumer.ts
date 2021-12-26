import type { CommandBuilder } from 'yargs'
import inquirer from 'inquirer'
import fuzzy from 'fuzzy'

import getKafkaAdmin from '../get-kafka-admin'
import { Action, ActionHandlers } from './consumer-actions'

export const command: string = 'consumer'
export const desc: string = 'Start consumer tools'
export const builder: CommandBuilder = yargs => yargs

export const handler = async (): Promise<void> => {
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

  // TODO seek to offset for each partition (one prompt per partition?)
  const { action } = await inquirer.prompt<{ action: Action }>({
    name: 'action',
    message: 'Which action?',
    type: 'list',
    choices: Object.values(Action)
  })

  await ActionHandlers[action]({ groupId, topic: selectedTopic })

  // TODO How do we recursively call handler?
  await kafkaAdmin.disconnect()
}
