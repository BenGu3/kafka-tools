import inquirer from 'inquirer'
import * as kafkajs from 'kafkajs'
import { when } from 'jest-when'

import { handler } from '../consumer'
import sandbox from '../../../test/sandbox'

jest.mock('kafkajs')

describe('commands/consumer', () => {
  const kafkaHost = 'kafka:9000'
  const groups = [{ groupId: 'group-one' }, { groupId: 'group-two' }]
  const groupId = 'consumer-group-one'
  const topic = 'org.team.v1.topic'
  const offsetsByTopic = [
    { topic, partitions: [{ partition: 0, offset: '0' }] }
  ]

  let listGroupsStub: jest.Mock
  let fetchOffsetsStub: jest.Mock
  let kafkaAdminStub: jest.Mock

  beforeEach(() => {
    when(sandbox.stub(inquirer, 'prompt'))
      .calledWith(expect.objectContaining({ name: 'kafkaHost' })).mockResolvedValue({ kafkaHost })
      .calledWith(expect.objectContaining({ name: 'groupId' })).mockResolvedValue({ groupId })
      .calledWith(expect.objectContaining({ name: 'topic' })).mockResolvedValue({ topic })

    listGroupsStub = sandbox.stub().mockResolvedValue({ groups })
    fetchOffsetsStub = sandbox.stub()
    when(fetchOffsetsStub)
      .calledWith({ groupId }).mockResolvedValue(offsetsByTopic)
      .calledWith({ groupId, topics: [topic] }).mockResolvedValue(offsetsByTopic)
    kafkaAdminStub = sandbox.stub().mockReturnValue({
      listGroups: listGroupsStub,
      fetchOffsets: fetchOffsetsStub
    })
    sandbox.stub(kafkajs, 'Kafka').mockReturnValue({ admin: kafkaAdminStub })
  })

  it('prompts to input Kafka host', async () => {
    await handler()

    expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'kafkaHost' }))
  })

  it('creates Kafka client/admin with kafka host', async () => {
    await handler()

    expect(kafkajs.Kafka).toHaveBeenCalledWith({ brokers: [kafkaHost] })
    expect(kafkaAdminStub).toHaveBeenCalled()
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
      const kafkaAdminStub = sandbox.stub().mockReturnValue({
        listGroups: listGroupsStub,
        fetchOffsets: fetchOffsetsStub
      })
      sandbox.stub(kafkajs, 'Kafka').mockReturnValue({ admin: kafkaAdminStub })

      await handler()

      expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'topic' }))
    })
  })
})
