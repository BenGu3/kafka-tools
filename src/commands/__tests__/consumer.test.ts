import { Arguments } from 'yargs'
import { when } from 'jest-when'

import { getConsumerOptions } from '../consumer'
import sandbox from '../../../test/sandbox'
import kafka from '../../kafka'
import config, { ConfigKey } from '../../config'

describe('commands/consumer', () => {
  describe('#getConsumerOptions', () => {
    const argv = {} as Arguments
    const groups = [{ groupId: 'group-one' }, { groupId: 'group-two' }]
    const groupId = 'consumer-group-one'
    const topic = 'org.team.v1.topic'
    const offsetsByTopic = [
      { topic, partitions: [{ partition: 0, offset: '0' }] }
    ]

    let listGroupsStub: jest.Mock
    let fetchOffsetsStub: jest.Mock

    beforeEach(() => {
      when(sandbox.stub(config, 'get'))
        .calledWith(expect.objectContaining({ configKey: ConfigKey.ConsumerGroupId })).mockResolvedValue(groupId)
        .calledWith(expect.objectContaining({ configKey: ConfigKey.Topic })).mockResolvedValue(topic)

      listGroupsStub = sandbox.stub().mockResolvedValue({ groups })
      fetchOffsetsStub = sandbox.stub().mockResolvedValue(offsetsByTopic)
      sandbox.stub(kafka, 'connect').mockResolvedValue({
        listGroups: listGroupsStub,
        fetchOffsets: fetchOffsetsStub
      })
    })

    it('connects to kafka', async () => {
      await getConsumerOptions(argv)

      expect(kafka.connect).toHaveBeenCalledWith(argv)
    })

    it('gets all Kafka consumer groups', async () => {
      await getConsumerOptions(argv)

      expect(listGroupsStub).toHaveBeenCalled()
    })

    it('gets consumer group id', async () => {
      const consumerGroupIds = groups.map(g => g.groupId)

      await getConsumerOptions(argv)

      expect(config.get).toHaveBeenCalledWith({ configKey: ConfigKey.ConsumerGroupId, consumerGroupIds, argv })
    })

    it('gets topics for selected consumer group', async () => {
      await getConsumerOptions(argv)

      expect(fetchOffsetsStub).toHaveBeenCalledWith({ groupId })
    })

    it('prompts to choose topic when consumer is consuming multiple topics', async () => {
      const offsetsByTopic = [
        { topic: 'another-topic', partitions: [{ partition: 0, offset: '0' }] },
        { topic, partitions: [{ partition: 0, offset: '0' }] }
      ]
      const fetchOffsetsStub = sandbox.stub().mockResolvedValue(offsetsByTopic)
      sandbox.stub(kafka, 'connect').mockResolvedValue({
        listGroups: listGroupsStub,
        fetchOffsets: fetchOffsetsStub
      })
      const topics = offsetsByTopic.map(o => o.topic)

      await getConsumerOptions(argv)

      expect(config.get).toHaveBeenCalledWith({ configKey: ConfigKey.Topic, topics, argv })
    })

    it('returns consumer options', async () => {
      const actual = await getConsumerOptions(argv)

      expect(actual).toEqual({ topic, groupId })
    })
  })
})
