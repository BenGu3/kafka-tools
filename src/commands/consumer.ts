import type { CommandBuilder } from 'yargs'
import inquirer from 'inquirer'
import { Kafka } from 'kafkajs'

import logger from '../logger'

type Options = {
}

export const command: string = 'consumer'
export const desc: string = 'Start consumer tools'
export const builder: CommandBuilder<Options, Options> = yargs => yargs

// TODO add better error handling for errors from `kafkajs`
export const handler = async (): Promise<void> => {
  const { kafkaHost } = await inquirer.prompt<{ kafkaHost: string }>({
    name: 'kafkaHost',
    message: 'What is your Kafka host?',
    type: 'input'
  })

  const kafkaClient = new Kafka({ brokers: [kafkaHost] })
  const kafkaAdmin = kafkaClient.admin()

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

  logger.info(`selectedTopic: ${selectedTopic}`)

  // TODO reset to earliest
  // TODO reset to timestamp (https://github.com/haversnail/inquirer-date-prompt)
  // TODO seek to offset for each partition (one prompt per partition?)
}
