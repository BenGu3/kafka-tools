import { ActionHandler } from './types'
import getKafkaAdmin from '../../get-kafka-admin'
import inquirer from 'inquirer'

const resetOffsets: ActionHandler = async params => {
  const { groupId, topic } = params
  const kafkaAdmin = await getKafkaAdmin()

  const { resetOffsetOption } = await inquirer.prompt<{ resetOffsetOption: ResetOffsetOption }>({
    name: 'resetOffsetOption',
    message: 'Reset to earliest or latest?',
    type: 'list',
    choices: Object.values(ResetOffsetOption)
  })

  const earliest = resetOffsetOption === ResetOffsetOption.Earliest
  await kafkaAdmin.resetOffsets({ groupId, topic, earliest })
}

export default resetOffsets

export enum ResetOffsetOption {
  Earliest = 'earliest',
  Latest = 'latest'
}
