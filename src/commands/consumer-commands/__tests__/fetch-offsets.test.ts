import * as table from 'table'
import { Arguments } from 'yargs'

import { handler } from '../fetch-offsets'
import sandbox from '../../../../test/sandbox'
import kafka from '../../../kafka'
import * as consumerCommand from '../../consumer'

describe('consumer-commands/fetch-offsets', () => {
  const argv = {} as Arguments
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
    sandbox.stub(consumerCommand, 'getConsumerOptions').mockResolvedValue({ groupId, topic })
    fetchOffsetsStub = sandbox.stub().mockResolvedValue(consumerOffsets)
    fetchTopicOffsetsStub = sandbox.stub().mockResolvedValue(topicOffsets)
    sandbox.stub(kafka, 'connect').mockResolvedValue({
      fetchOffsets: fetchOffsetsStub,
      fetchTopicOffsets: fetchTopicOffsetsStub
    })
    sandbox.stub(table, 'table')
    sandbox.stub(console, 'log')
  })

  it('gets consumer options', async () => {
    await handler(argv)

    expect(consumerCommand.getConsumerOptions).toHaveBeenCalledWith(argv)
  })

  it('connects to kafka', async () => {
    await handler(argv)

    expect(kafka.connect).toHaveBeenCalledWith(argv)
  })

  it('fetches consumer offsets', async () => {
    await handler(argv)

    expect(fetchOffsetsStub).toHaveBeenCalledWith({ groupId, topics: [topic] })
  })

  it('fetches topic offsets', async () => {
    await handler(argv)

    expect(fetchTopicOffsetsStub).toHaveBeenCalledWith(topic)
  })

  it('logs out offsets', async () => {
    const tableData = [
      ['Partition', 'Current offset', 'Max offset', 'Lag', 'Progress'],
      [0, 12, 120, 108, 10],
      [1, 15, 150, 135, 10],
      [2, 10, 100, 90, 10]
    ]
    await handler(argv)

    expect(table.table).toHaveBeenCalledWith(tableData)
    expect(console.log).toHaveBeenCalled()
  })
})
