import * as table from 'table'

import subject from '../fetch-offsets'
import sandbox from '../../../../test/sandbox'
import * as getKafkaAdmin from '../../../get-kafka-admin'

describe('consumer-actions/fetch-offsets', () => {
  const groupId = 'consumer-group-one'
  const topic = 'org.team.v1.topic'
  const consumerOffsets = [{
    topic,
    partitions: [
      { partition: 2, offset: '10' },
      { partition: 1, offset: '15' },
      { partition: 0, offset: '12' }
    ]
  }]
  const topicOffsets = [
    { partition: 2, offset: '100' },
    { partition: 1, offset: '150' },
    { partition: 0, offset: '120' }
  ]

  let fetchOffsetsStub: jest.Mock
  let fetchTopicOffsetsStub: jest.Mock

  beforeEach(() => {
    fetchOffsetsStub = sandbox.stub().mockResolvedValue(consumerOffsets)
    fetchTopicOffsetsStub = sandbox.stub().mockResolvedValue(topicOffsets)
    sandbox.stub(getKafkaAdmin, 'default').mockResolvedValue({
      fetchOffsets: fetchOffsetsStub,
      fetchTopicOffsets: fetchTopicOffsetsStub
    })
    sandbox.stub(table, 'table')
    sandbox.stub(console, 'log')
  })

  it('fetches consumer offsets', async () => {
    await subject({ groupId, topic })

    expect(fetchOffsetsStub).toHaveBeenCalledWith({ groupId, topics: [topic] })
  })

  it('fetches topic offsets', async () => {
    await subject({ groupId, topic })

    expect(fetchTopicOffsetsStub).toHaveBeenCalledWith(topic)
  })

  it('logs out offsets', async () => {
    const tableData = [
      ['Partition', 'Current offset', 'Max offset', 'Lag', 'Progress'],
      [0, 12, 120, 108, 10],
      [1, 15, 150, 135, 10],
      [2, 10, 100, 90, 10]
    ]
    await subject({ groupId, topic })

    expect(table.table).toHaveBeenCalledWith(tableData)
    expect(console.log).toHaveBeenCalled()
  })
})
