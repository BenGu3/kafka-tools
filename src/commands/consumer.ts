import type { CommandBuilder } from 'yargs'
import inquirer from 'inquirer'

import getKafkaAdmin from '../get-kafka-admin'
import { Action, ActionHandlers } from './consumer-actions'

type Options = {
}

export const command: string = 'consumer'
export const desc: string = 'Start consumer tools'
export const builder: CommandBuilder<Options, Options> = yargs => yargs

// TODO add better error handling for errors from `kafkajs`
export const handler = async (): Promise<void> => {
  const kafkaAdmin = await getKafkaAdmin()
  const { groups } = await kafkaAdmin.listGroups()
  const groupIds = groups.map(group => group.groupId)

  // TODO add better initial "no results" message
  const { groupId } = await inquirer.prompt<{ groupId: string }>({
    name: 'groupId',
    message: 'Which consumer?',
    type: 'autocomplete' as any,
    source: ((_answersSoFar: any, input: string) => groupIds.filter(id => id.includes(input))) as any
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

  // TODO reset to earliest
  // TODO reset to timestamp (https://github.com/haversnail/inquirer-date-prompt)
  // TODO seek to offset for each partition (one prompt per partition?)
  const { action } = await inquirer.prompt<{ action: Action }>({
    name: 'action',
    message: 'Which action?',
    type: 'list',
    choices: Object.values(Action)
  })

  await ActionHandlers[action]({ groupId, topic: selectedTopic })

  // TODO How do we recursively call handler?
  // process.exit() // TODO why isn't yargs exiting?
}
