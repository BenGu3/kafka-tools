import { Arguments } from 'yargs'

import { handler, ResetOffsetOption } from '../reset-offsets'
import * as consumerCommand from '../../consumer'
import sandbox from '../../../../test/sandbox'
import kafka from '../../../kafka'
import config, { ConfigKey } from '../../../config'

describe('consumer-commands/reset-offsets', () => {
  const argv = {} as Arguments
  const groupId = 'consumer-group-one'
  const topic = 'org.team.v1.topic'
  const resetOffsetOption = ResetOffsetOption.Earliest
  const partitionsAtTimestamp = [
    { partition: 0, offset: '5' },
    { partition: 1, offset: '10' }
  ]

  let resetOffsetsStub: jest.Mock
  let fetchTopicOffsetsByTimestampStub: jest.Mock
  let setOffsetsStub: jest.Mock

  beforeEach(() => {
    sandbox.stub(consumerCommand, 'getConsumerOptions').mockResolvedValue({ groupId, topic })
    sandbox.stub(config, 'get').mockResolvedValue(resetOffsetOption)
    resetOffsetsStub = sandbox.stub()
    fetchTopicOffsetsByTimestampStub = sandbox.stub().mockResolvedValue(partitionsAtTimestamp)
    setOffsetsStub = sandbox.stub()
    sandbox.stub(kafka, 'connect').mockResolvedValue({
      resetOffsets: resetOffsetsStub,
      fetchTopicOffsetsByTimestamp: fetchTopicOffsetsByTimestampStub,
      setOffsets: setOffsetsStub
    })
  })

  it('gets consumer options', async () => {
    await handler(argv)

    expect(consumerCommand.getConsumerOptions).toHaveBeenCalledWith(argv)
  })

  it('connects to kafka', async () => {
    await handler(argv)

    expect(kafka.connect).toHaveBeenCalledWith(argv)
  })

  it('gets reset offsets option', async () => {
    await handler(argv)

    expect(config.get).toHaveBeenCalledWith(expect.objectContaining({ configKey: ConfigKey.ResetOffsetsOption, argv }))
  })

  it('resets consumer offsets to latest when latest is selected', async () => {
    sandbox.stub(config, 'get').mockResolvedValue(ResetOffsetOption.Latest)

    await handler(argv)

    expect(resetOffsetsStub).toHaveBeenCalledWith({ groupId, topic, earliest: false })
  })

  it('resets consumer offsets to earliest when earliest is selected', async () => {
    sandbox.stub(config, 'get').mockResolvedValue(ResetOffsetOption.Earliest)

    await handler(argv)

    expect(resetOffsetsStub).toHaveBeenCalledWith({ groupId, topic, earliest: true })
  })

  it('resets consumer offset to timestamp when timestamp is selected', async () => {
    const resetTimestamp = new Date()
    sandbox.stub(config, 'get').mockResolvedValue(resetTimestamp)

    await handler(argv)

    expect(fetchTopicOffsetsByTimestampStub).toHaveBeenCalledWith(topic, resetTimestamp.getTime())
    expect(setOffsetsStub).toHaveBeenCalledWith({ groupId, topic, partitions: partitionsAtTimestamp })
  })
})
