import type { CommandBuilder } from 'yargs'
import inquirer from 'inquirer'
import { Kafka } from 'kafkajs'

type Options = {
}

export const command: string = 'consumer'
export const desc: string = 'Start consumer tools'
export const builder: CommandBuilder<Options, Options> = yargs => yargs

export const handler = async (): Promise<void> => {
  const { kafkaHost } = await inquirer.prompt({
    name: 'kafkaHost',
    message: 'What is your Kafka host?',
    type: 'input'
  })

  const kafkaClient = new Kafka({ brokers: [kafkaHost] })
  const kafkaAdmin = kafkaClient.admin()

  const { groups } = await kafkaAdmin.listGroups()
  const groupIds = groups.map(group => group.groupId)

  // TODO add better initial "no results" message
  const { consumerGroup } = await inquirer.prompt({
    name: 'consumerGroup',
    message: 'Which consumer?',
    type: 'autocomplete' as any,
    source: ((_answersSoFar: any, input: string) => groupIds.filter(id => id.includes(input))) as any
  })

  const offsetsByTopic = await kafkaAdmin.fetchOffsets({ groupId: consumerGroup })
  const topics = offsetsByTopic.map(topicOffsets => topicOffsets.topic)

  let topic = topics[0]
  if (topics.length > 1) {
    const { selectedTopic } = await inquirer.prompt({
      name: 'selectedTopic',
      message: 'Which topic?',
      type: 'list',
      choices: topics
    })

    topic = selectedTopic
  }

  console.log('topic:', topic)

  // process.exit() // TODO why isn't yargs exiting?

  // TODO reset to earliest
  // TODO reset to timestamp (https://github.com/haversnail/inquirer-date-prompt)
  // TODO seek to offset for each partition (one prompt per partition?)
}
