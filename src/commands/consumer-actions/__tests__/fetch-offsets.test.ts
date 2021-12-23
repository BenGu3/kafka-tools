import subject from '../fetch-offsets'
import sandbox from '../../../../test/sandbox'
import * as getKafkaAdmin from '../../../get-kafka-admin'

describe('consumer-actions/fetch-offsets', () => {
  const groupId = 'consumer-group-one'
  const topic = 'org.team.v1.topic'
  const offsetsByTopic = [{
    topic,
    partitions: [
      { partition: 2, offset: '10' },
      { partition: 1, offset: '15' },
      { partition: 0, offset: '12' }
    ]
  }]

  let fetchOffsetsStub: jest.Mock

  beforeEach(() => {
    fetchOffsetsStub = sandbox.stub().mockResolvedValue(offsetsByTopic)
    sandbox.stub(getKafkaAdmin, 'default').mockResolvedValue({ fetchOffsets: fetchOffsetsStub })
  })

  it('fetches offsets with kafkaAdmin', async () => {
    await subject({ groupId, topic })

    expect(fetchOffsetsStub).toHaveBeenCalledWith({ groupId, topics: [topic] })
  })
})
