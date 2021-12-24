import inquirer from 'inquirer'

import subject, { ResetOffsetOption } from '../reset-offsets'
import sandbox from '../../../../test/sandbox'
import * as getKafkaAdmin from '../../../get-kafka-admin'

describe('consumer-actions/reset-offsets', () => {
  const groupId = 'consumer-group-one'
  const topic = 'org.team.v1.topic'
  const resetOffsetOption = true

  let resetOffsetsStub: jest.Mock

  beforeEach(() => {
    sandbox.stub(inquirer, 'prompt').mockResolvedValue({ resetOffsetOption })
    resetOffsetsStub = sandbox.stub()
    sandbox.stub(getKafkaAdmin, 'default').mockResolvedValue({
      resetOffsets: resetOffsetsStub,
    })
  })

  it('prompts for earliest or latest offset', async () => {
    await subject({ groupId, topic })

    expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'resetOffsetOption' }))
  })

  it('resets consumer offsets to latest when latest selected', async () => {
    sandbox.stub(inquirer, 'prompt').mockResolvedValue({ resetOffsetOption: ResetOffsetOption.Latest })

    await subject({ groupId, topic })

    expect(resetOffsetsStub).toHaveBeenCalledWith({ groupId, topic, earliest: false })
  })

  it('resets consumer offsets to earliest when earliest selected', async () => {
    sandbox.stub(inquirer, 'prompt').mockResolvedValue({ resetOffsetOption: ResetOffsetOption.Earliest })

    await subject({ groupId, topic })

    expect(resetOffsetsStub).toHaveBeenCalledWith({ groupId, topic, earliest: true })
  })
})
