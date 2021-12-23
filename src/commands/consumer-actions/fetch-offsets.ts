import keyBy from 'lodash/keyBy'
import { table } from 'table'

import { ActionHandler } from './types'
import getKafkaAdmin from '../../get-kafka-admin'

const fetchOffsets: ActionHandler = async params => {
  const { groupId, topic } = params
  const kafkaAdmin = await getKafkaAdmin()

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

export default fetchOffsets
