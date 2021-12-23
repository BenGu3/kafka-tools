import sortBy from 'lodash/sortBy'
import { table } from 'table'

import { ActionHandler } from './types'
import getKafkaAdmin from '../../get-kafka-admin'

// TODO add max offset
// TODO add lag
// TODO add % complete
const fetchOffsets: ActionHandler = async params => {
  const { groupId, topic } = params
  const kafkaAdmin = await getKafkaAdmin()
  const offsetsByTopic = await kafkaAdmin.fetchOffsets({ groupId, topics: [topic] })
  const partitions = offsetsByTopic.find(offsets => offsets.topic === topic)?.partitions
  const sortedPartitions = sortBy(partitions, 'partition')

  const tableHeader = ['Partition', 'Current offset']
  const tableData = sortedPartitions.map(partition => [partition.partition, partition.offset])
  console.log(table([tableHeader, ...tableData]))
}

export default fetchOffsets
