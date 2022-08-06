import { CommandBuilder, Arguments } from 'yargs'

import kafka from '../../kafka'
import { getConsumerOptions } from '../consumer'
import config, { ConfigKey } from '../../config'

export const command: string = 'reset-offsets'
export const desc: string = 'Reset offsets'
export const builder: CommandBuilder = yargs => yargs

export const handler = async (argv: Arguments): Promise<void> => {
  const { groupId, topic } = await getConsumerOptions(argv)
  const kafkaAdmin = await kafka.connect(argv)

  const resetOffsetsOption = await config.get({ configKey: ConfigKey.ResetOffsetsOption, argv })

  if (resetOffsetsOption instanceof Date) {
    const partitionsAtTimestamp = await kafkaAdmin.fetchTopicOffsetsByTimestamp(topic, resetOffsetsOption.getTime())
    await kafkaAdmin.setOffsets({ groupId, topic, partitions: partitionsAtTimestamp })
  } else {
    const earliest = resetOffsetsOption === ResetOffsetOption.Earliest
    await kafkaAdmin.resetOffsets({ groupId, topic, earliest })
  }
}

export enum ResetOffsetOption {
  Earliest = 'earliest',
  Latest = 'latest',
  Timestamp = 'specific time'
}
