import subject from '../fetch-offsets'
import sandbox from '../../../../test/sandbox'
import * as getKafkaAdmin from '../../../get-kafka-admin'

describe('consumer-actions/fetch-offsets', () => {
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
    fetchOffsetsStub = sandbox.stub().mockResolvedValue(consumerOffsets)
    fetchTopicOffsetsStub = sandbox.stub().mockResolvedValue(topicOffsets)
    sandbox.stub(getKafkaAdmin, 'default').mockResolvedValue({
      fetchOffsets: fetchOffsetsStub,
      fetchTopicOffsets: fetchTopicOffsetsStub
    })
  })

  it('fetches consumer offsets', async () => {
    await subject({ groupId, topic })

    expect(fetchOffsetsStub).toHaveBeenCalledWith({ groupId, topics: [topic] })
  })

  it('fetches topic offsets', async () => {
    await subject({ groupId, topic })

    expect(fetchTopicOffsetsStub).toHaveBeenCalledWith(topic)
  })
})
