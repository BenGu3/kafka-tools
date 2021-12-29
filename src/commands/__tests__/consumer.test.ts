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
  let disconnectStub: jest.Mock

  beforeEach(() => {
    when(sandbox.stub(inquirer, 'prompt'))
      .calledWith(expect.objectContaining({ name: 'groupId' })).mockResolvedValue({ groupId })
      .calledWith(expect.objectContaining({ name: 'topic' })).mockResolvedValue({ topic })
      .calledWith(expect.objectContaining({ name: 'action' })).mockResolvedValue({ action: Action.FetchOffsets })

    listGroupsStub = sandbox.stub().mockResolvedValue({ groups })
    fetchOffsetsStub = sandbox.stub().mockResolvedValue(offsetsByTopic)
    disconnectStub = sandbox.stub()
    sandbox.stub(getKafkaAdmin, 'default').mockResolvedValue({
      listGroups: listGroupsStub,
      fetchOffsets: fetchOffsetsStub,
      disconnect: disconnectStub
    })
    sandbox.stub(ActionHandlers, Action.FetchOffsets)
    sandbox.stub(ActionHandlers, Action.ResetOffsets)
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

  it('prompts to choose topic when consumer is consuming multiple topics', async () => {
    const offsetsByTopic = [
      { topic: 'another-topic', partitions: [{ partition: 0, offset: '0' }] },
      { topic, partitions: [{ partition: 0, offset: '0' }] }
    ]
    const fetchOffsetsStub = sandbox.stub().mockResolvedValue(offsetsByTopic)
    sandbox.stub(getKafkaAdmin, 'default').mockResolvedValue({
      listGroups: listGroupsStub,
      fetchOffsets: fetchOffsetsStub,
      disconnect: disconnectStub
    })
    await handler()

    expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'topic' }))
  })

  it('prompts to choose consumer action', async () => {
    await handler()

    expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'action' }))
  })

  it('fetches offsets for groupId and topic when action is Action.FetchOffsets', async () => {
    when(sandbox.stub(inquirer, 'prompt'))
      .calledWith(expect.objectContaining({ name: 'groupId' })).mockResolvedValue({ groupId })
      .calledWith(expect.objectContaining({ name: 'topic' })).mockResolvedValue({ topic })
      .calledWith(expect.objectContaining({ name: 'action' })).mockResolvedValue({ action: Action.FetchOffsets })

    await handler()

    expect(ActionHandlers[Action.FetchOffsets]).toHaveBeenCalledWith({ groupId, topic })
  })

  it('resets offsets for groupId and topic when action is Action.ResetOffsets', async () => {
    when(sandbox.stub(inquirer, 'prompt'))
      .calledWith(expect.objectContaining({ name: 'groupId' })).mockResolvedValue({ groupId })
      .calledWith(expect.objectContaining({ name: 'topic' })).mockResolvedValue({ topic })
      .calledWith(expect.objectContaining({ name: 'action' })).mockResolvedValue({ action: Action.ResetOffsets })

    await handler()

    expect(ActionHandlers[Action.ResetOffsets]).toHaveBeenCalledWith({ groupId, topic })
  })

  it('disconnects from kafka', async () => {
    await handler()

    expect(disconnectStub).toHaveBeenCalled()
  })
})