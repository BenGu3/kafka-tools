import * as kafkajs from 'kafkajs'
import { Arguments } from 'yargs'
import { Type as AwsIamAuthType } from '@jm18457/kafkajs-msk-iam-authentication-mechanism'
import { when } from 'jest-when'

import subject, { KafkaAuthType, resetKafkaAdmin } from '../kafka'
import sandbox from '../../test/sandbox'
import config, { ConfigKey } from '../config'

jest.mock('kafkajs')

describe('kafka', () => {
  const kafkaAuth = KafkaAuthType.None
  const kafkaHost = 'kafka:9000'
  const argv = { } as Arguments

  let disconnectStub: jest.Mock
  let kafkaAdminStub: Record<string, jest.Mock>
  let kafkaAdminConstructorStub: jest.Mock

  beforeEach(() => {
    resetKafkaAdmin()
    when(sandbox.stub(config, 'get'))
      .calledWith(expect.objectContaining({ configKey: ConfigKey.KafkaAuth })).mockResolvedValue(kafkaAuth)
      .calledWith(expect.objectContaining({ configKey: ConfigKey.KafkaHost })).mockResolvedValue(kafkaHost)
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

    it('uses IAM auth when KafkaAuthType is IAM', async () => {
      when(sandbox.stub(config, 'get'))
        .calledWith(expect.objectContaining({ configKey: ConfigKey.KafkaAuth })).mockResolvedValue(KafkaAuthType.IAM)
        .calledWith(expect.objectContaining({ configKey: ConfigKey.KafkaHost })).mockResolvedValue(kafkaHost)
      const expectedKafkaParams = expect.objectContaining({
        brokers: [kafkaHost],
        ssl: true,
        sasl: {
          mechanism: AwsIamAuthType,
          authenticationProvider: expect.any(Function)
        }
      })

      await subject.connect(argv)

      expect(config.get).toHaveBeenCalledWith({ configKey: ConfigKey.KafkaAuth, argv })
      expect(kafkajs.Kafka).toHaveBeenCalledWith(expectedKafkaParams)
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
