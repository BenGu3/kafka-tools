import inquirer from 'inquirer'
import { when } from 'jest-when'

import subject, { ResetOffsetOption } from '../reset-offsets'
import sandbox from '../../../../test/sandbox'
import * as getKafkaAdmin from '../../../get-kafka-admin'

describe('consumer-actions/reset-offsets', () => {
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
    sandbox.stub(inquirer, 'prompt').mockResolvedValue({ resetOffsetOption })
    resetOffsetsStub = sandbox.stub()
    fetchTopicOffsetsByTimestampStub = sandbox.stub().mockResolvedValue(partitionsAtTimestamp)
    setOffsetsStub = sandbox.stub()
    sandbox.stub(getKafkaAdmin, 'default').mockResolvedValue({
      resetOffsets: resetOffsetsStub,
      fetchTopicOffsetsByTimestamp: fetchTopicOffsetsByTimestampStub,
      setOffsets: setOffsetsStub
    })
  })

  it('prompts for earliest or latest offset', async () => {
    await subject({ groupId, topic })

    expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'resetOffsetOption' }))
  })

  it('resets consumer offsets to latest when latest is selected', async () => {
    sandbox.stub(inquirer, 'prompt').mockResolvedValue({ resetOffsetOption: ResetOffsetOption.Latest })

    await subject({ groupId, topic })

    expect(resetOffsetsStub).toHaveBeenCalledWith({ groupId, topic, earliest: false })
  })

  it('resets consumer offsets to earliest when earliest is selected', async () => {
    sandbox.stub(inquirer, 'prompt').mockResolvedValue({ resetOffsetOption: ResetOffsetOption.Earliest })

    await subject({ groupId, topic })

    expect(resetOffsetsStub).toHaveBeenCalledWith({ groupId, topic, earliest: true })
  })

  it('resets consumer offset to timestamp when timestamp is selected', async () => {
    const resetTimestamp = new Date().getTime()
    when(sandbox.stub(inquirer, 'prompt'))
      .calledWith(expect.objectContaining({ name: 'resetOffsetOption' })).mockResolvedValue({ resetOffsetOption: ResetOffsetOption.Timestamp })
      .calledWith(expect.objectContaining({ name: 'resetTimestamp' })).mockResolvedValue({ resetTimestamp: new Date(resetTimestamp) })

    await subject({ groupId, topic })

    expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'resetTimestamp' }))
    expect(fetchTopicOffsetsByTimestampStub).toHaveBeenCalledWith(topic, resetTimestamp)
    expect(setOffsetsStub).toHaveBeenCalledWith({ groupId, topic, partitions: partitionsAtTimestamp })
  })
})
