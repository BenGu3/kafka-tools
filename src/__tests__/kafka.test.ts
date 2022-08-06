import * as kafkajs from 'kafkajs'
import { Arguments } from 'yargs'

import subject, { resetKafkaAdmin } from '../kafka'
import sandbox from '../../test/sandbox'
import config, { ConfigKey } from '../config'

jest.mock('kafkajs')

describe('kafka', () => {
  const kafkaHost = 'kafka:9000'
  const argv = { } as Arguments

  let disconnectStub: jest.Mock
  let kafkaAdminStub: Record<string, jest.Mock>
  let kafkaAdminConstructorStub: jest.Mock

  beforeEach(() => {
    resetKafkaAdmin()
    sandbox.stub(config, 'get').mockReturnValue(kafkaHost)
    disconnectStub = sandbox.stub()
    kafkaAdminStub = { disconnect: disconnectStub }
    kafkaAdminConstructorStub = sandbox.stub().mockReturnValue(kafkaAdminStub)
    sandbox.stub(kafkajs, 'Kafka').mockReturnValue({ admin: kafkaAdminConstructorStub })
  })

  describe('#connect', () => {
    it('gets kafkaHost from config', async () => {
      await subject.connect(argv)

      expect(config.get).toHaveBeenCalledWith({ configKey: ConfigKey.KafkaHost, argv })
      expect(kafkajs.Kafka).toHaveBeenCalledWith(expect.objectContaining({ brokers: [kafkaHost] }))
    })

    it('returns Kafka client/admin with kafka host', async () => {
      const actual = await subject.connect(argv)

      expect(kafkajs.Kafka).toHaveBeenCalledWith(expect.objectContaining({ brokers: [kafkaHost] }))
      expect(kafkaAdminConstructorStub).toHaveBeenCalled()
      expect(actual).toEqual(kafkaAdminStub)
    })

    it('does not create admin twice', async () => {
      await subject.connect(argv)
      const actual = await subject.connect(argv)

      expect(kafkajs.Kafka).toHaveBeenCalledTimes(1)
      expect(kafkaAdminConstructorStub).toHaveBeenCalledTimes(1)
      expect(actual).toEqual(kafkaAdminStub)
    })
  })

  describe('#disconnect', () => {
    it('disconnects when kafkaAdmin is not null', async () => {
      await subject.connect(argv)
      await subject.disconnect()

      expect(disconnectStub).toHaveBeenCalled()
    })

    it('does not disconnect when kafkaAdmin is null', async () => {
      await subject.disconnect()

      expect(disconnectStub).not.toHaveBeenCalled()
    })
  })
})
