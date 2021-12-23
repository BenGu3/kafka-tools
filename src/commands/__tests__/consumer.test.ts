import inquirer from 'inquirer'
import { when } from 'jest-when'

import { handler } from '../consumer'
import sandbox from '../../../test/sandbox'
import { Action, ActionHandlers } from '../consumer-actions'
import * as getKafkaAdmin from '../../get-kafka-admin'

describe('commands/consumer', () => {
  const groups = [{ groupId: 'group-one' }, { groupId: 'group-two' }]
  const groupId = 'consumer-group-one'
  const topic = 'org.team.v1.topic'
  const offsetsByTopic = [
    { topic, partitions: [{ partition: 0, offset: '0' }] }
  ]

  let listGroupsStub: jest.Mock
  let fetchOffsetsStub: jest.Mock

  beforeEach(() => {
    when(sandbox.stub(inquirer, 'prompt'))
      .calledWith(expect.objectContaining({ name: 'groupId' })).mockResolvedValue({ groupId })
      .calledWith(expect.objectContaining({ name: 'topic' })).mockResolvedValue({ topic })
      .calledWith(expect.objectContaining({ name: 'action' })).mockResolvedValue({ action: Action.FetchOffsets })

    listGroupsStub = sandbox.stub().mockResolvedValue({ groups })
    fetchOffsetsStub = sandbox.stub().mockResolvedValue(offsetsByTopic)
    sandbox.stub(getKafkaAdmin, 'default').mockResolvedValue({
      listGroups: listGroupsStub,
      fetchOffsets: fetchOffsetsStub
    })
    sandbox.stub(ActionHandlers, Action.FetchOffsets)
  })

  it('gets all Kafka consumer groups', async () => {
    await handler()

    expect(listGroupsStub).toHaveBeenCalled()
  })

  it('prompts to choose which consumer group', async () => {
    await handler()

    expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'groupId' }))
  })

  it('gets topics for selected consumer group', async () => {
    await handler()

    expect(fetchOffsetsStub).toHaveBeenCalledWith({ groupId })
  })

  describe('when consumer is consuming multiple topics', () => {
    it('prompts to choose topic', async () => {
      const offsetsByTopic = [
        { topic: 'another-topic', partitions: [{ partition: 0, offset: '0' }] },
        { topic: topic, partitions: [{ partition: 0, offset: '0' }] }
      ]
      const fetchOffsetsStub = sandbox.stub().mockResolvedValue(offsetsByTopic)
      sandbox.stub(getKafkaAdmin, 'default').mockResolvedValue({
        listGroups: listGroupsStub,
        fetchOffsets: fetchOffsetsStub
      })
      await handler()

      expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'topic' }))
    })

    it('prompts to choose consumer action', async () => {
      await handler()

      expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'action' }))
    })

    describe('when action is Action.FetchOffsets', () => {
      it('fetches offsets for groupId and topic', async () => {
        await handler()

        expect(ActionHandlers[Action.FetchOffsets]).toHaveBeenCalledWith({ groupId, topic })
      })
    })
  })
})
