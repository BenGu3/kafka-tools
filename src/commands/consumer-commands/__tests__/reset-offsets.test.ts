import inquirer from 'inquirer'
import { when } from 'jest-when'

import { handler, ResetOffsetOption } from '../reset-offsets'
import * as consumerCommand from '../../consumer'
import sandbox from '../../../../test/sandbox'
import * as kafka from '../../../kafka'

describe('consumer-commands/reset-offsets', () => {
  const groupId = 'consumer-group-one'
  const topic = 'org.team.v1.topic'
  const resetOffsetOption = true
  const partitionsAtTimestamp = [
    { partition: 0, offset: '5' },
    { partition: 1, offset: '10' }
  ]

  let resetOffsetsStub: jest.Mock
  let fetchTopicOffsetsByTimestampStub: jest.Mock
  let setOffsetsStub: jest.Mock

  beforeEach(() => {
    sandbox.stub(consumerCommand, 'getConsumerOptions').mockResolvedValue({ groupId, topic })
    sandbox.stub(inquirer, 'prompt').mockResolvedValue({ resetOffsetOption })
    resetOffsetsStub = sandbox.stub()
    fetchTopicOffsetsByTimestampStub = sandbox.stub().mockResolvedValue(partitionsAtTimestamp)
    setOffsetsStub = sandbox.stub()
    sandbox.stub(kafka.default, 'connect').mockResolvedValue({
      resetOffsets: resetOffsetsStub,
      fetchTopicOffsetsByTimestamp: fetchTopicOffsetsByTimestampStub,
      setOffsets: setOffsetsStub
    })
  })

  it('prompts for earliest or latest offset', async () => {
    await handler()

    expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'resetOffsetOption' }))
  })

  it('resets consumer offsets to latest when latest is selected', async () => {
    sandbox.stub(inquirer, 'prompt').mockResolvedValue({ resetOffsetOption: ResetOffsetOption.Latest })

    await handler()

    expect(resetOffsetsStub).toHaveBeenCalledWith({ groupId, topic, earliest: false })
  })

  it('resets consumer offsets to earliest when earliest is selected', async () => {
    sandbox.stub(inquirer, 'prompt').mockResolvedValue({ resetOffsetOption: ResetOffsetOption.Earliest })

    await handler()

    expect(resetOffsetsStub).toHaveBeenCalledWith({ groupId, topic, earliest: true })
  })

  it('resets consumer offset to timestamp when timestamp is selected', async () => {
    const resetTimestamp = new Date().getTime()
    when(sandbox.stub(inquirer, 'prompt'))
      .calledWith(expect.objectContaining({ name: 'resetOffsetOption' })).mockResolvedValue({ resetOffsetOption: ResetOffsetOption.Timestamp })
      .calledWith(expect.objectContaining({ name: 'resetTimestamp' })).mockResolvedValue({ resetTimestamp: new Date(resetTimestamp) })

    await handler()

    expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'resetTimestamp' }))
    expect(fetchTopicOffsetsByTimestampStub).toHaveBeenCalledWith(topic, resetTimestamp)
    expect(setOffsetsStub).toHaveBeenCalledWith({ groupId, topic, partitions: partitionsAtTimestamp })
  })
})
