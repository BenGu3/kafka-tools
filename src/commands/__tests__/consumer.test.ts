import inquirer from 'inquirer'
import { when } from 'jest-when'

import { getConsumerOptions } from '../consumer'
import sandbox from '../../../test/sandbox'
import * as getKafkaAdmin from '../../get-kafka-admin'

describe('commands/consumer', () => {
  describe('#getConsumerOptions', () => {
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

      listGroupsStub = sandbox.stub().mockResolvedValue({ groups })
      fetchOffsetsStub = sandbox.stub().mockResolvedValue(offsetsByTopic)
      sandbox.stub(getKafkaAdmin, 'default').mockResolvedValue({
        listGroups: listGroupsStub,
        fetchOffsets: fetchOffsetsStub
      })
    })

    it('gets all Kafka consumer groups', async () => {
      await getConsumerOptions()

      expect(listGroupsStub).toHaveBeenCalled()
    })

    it('prompts to choose which consumer group', async () => {
      await getConsumerOptions()

      expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'groupId' }))
    })

    it('gets topics for selected consumer group', async () => {
      await getConsumerOptions()

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
        fetchOffsets: fetchOffsetsStub
      })
      await getConsumerOptions()

      expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'topic' }))
    })

    it('returns consumer options', async () => {
      const actual = await getConsumerOptions()

      expect(actual).toEqual({ topic, groupId })
    })
  })
})
