import { ActionHandler } from './types'
import getKafkaAdmin from '../../get-kafka-admin'
import inquirer from 'inquirer'

const resetOffsets: ActionHandler = async params => {
  const { groupId, topic } = params
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

export default resetOffsets

export enum ResetOffsetOption {
  Earliest = 'earliest',
  Latest = 'latest',
  Timestamp = 'specific time'
}
