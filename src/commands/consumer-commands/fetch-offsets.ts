import { Arguments, CommandBuilder } from 'yargs'
import keyBy from 'lodash/keyBy'
import { table } from 'table'

import kafka from '../../kafka'
import { getConsumerOptions } from '../consumer'

export const command: string = 'fetch-offsets'
export const desc: string = 'Fetch offsets'
export const builder: CommandBuilder = yargs => yargs

export const handler = async (argv: Arguments): Promise<void> => {
  const { groupId, topic } = await getConsumerOptions(argv)
  const kafkaAdmin = await kafka.connect(argv)

  const consumerOffsets = await kafkaAdmin.fetchOffsets({ groupId, topics: [topic] })
  const topicConsumerOffsets = consumerOffsets.find(offsets => offsets.topic === topic)?.partitions
  const consumerOffsetsByPartition = keyBy(topicConsumerOffsets, 'partition')

  const topicOffsets = await kafkaAdmin.fetchTopicOffsets(topic)
  const topicOffsetsByPartition = keyBy(topicOffsets, 'partition')

  const sortedPartitions = Object.keys(consumerOffsetsByPartition).sort()
  const tableData = sortedPartitions.reduce<number[][]>((rows, partition) => {
    const currentOffset = parseInt(consumerOffsetsByPartition[partition].offset)
    const maxOffset = parseInt(topicOffsetsByPartition[partition].offset)
    const lag = maxOffset - currentOffset
    const progress = maxOffset === 0 ? 0 : (currentOffset / maxOffset) * 100
    const row = [parseInt(partition), currentOffset, maxOffset, lag, progress]

    rows.push(row)

    return rows
  }, [])

  const tableHeader = ['Partition', 'Current offset', 'Max offset', 'Lag', 'Progress']
  console.log(table([tableHeader, ...tableData]))
}
