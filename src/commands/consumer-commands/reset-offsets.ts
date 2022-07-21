import inquirer from 'inquirer'
import { CommandBuilder } from 'yargs'

import getKafkaAdmin from '../../get-kafka-admin'
import { getConsumerOptions } from '../consumer'

export const command: string = 'reset-offsets'
export const desc: string = 'Reset offsets'
export const builder: CommandBuilder = yargs => yargs

export const handler = async (): Promise<void> => {
  const { groupId, topic } = await getConsumerOptions()
  const kafkaAdmin = await getKafkaAdmin()

  const { resetOffsetOption } = await inquirer.prompt<{ resetOffsetOption: ResetOffsetOption }>({
    name: 'resetOffsetOption',
    message: 'Reset to earliest, latest, or a specific time?',
    type: 'list',
    choices: Object.values(ResetOffsetOption)
  })

  if (resetOffsetOption === ResetOffsetOption.Timestamp) {
    const { resetTimestamp } = await inquirer.prompt<{ resetTimestamp: Date }>({
      name: 'resetTimestamp',
      message: 'Reset offsets to when?',
      type: 'date' as any
    })

    const partitionsAtTimestamp = await kafkaAdmin.fetchTopicOffsetsByTimestamp(topic, resetTimestamp.getTime())
    await kafkaAdmin.setOffsets({ groupId, topic, partitions: partitionsAtTimestamp })
  } else {
    const earliest = resetOffsetOption === ResetOffsetOption.Earliest
    await kafkaAdmin.resetOffsets({ groupId, topic, earliest })
  }
}

export enum ResetOffsetOption {
  Earliest = 'earliest',
  Latest = 'latest',
  Timestamp = 'specific time'
}
