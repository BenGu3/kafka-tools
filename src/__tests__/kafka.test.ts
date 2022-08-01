import inquirer from 'inquirer'
import * as kafkajs from 'kafkajs'
import { when } from 'jest-when'

import subject, { resetKafkaAdmin } from '../kafka'
import sandbox from '../../test/sandbox'
import config from '../config'

jest.mock('kafkajs')

describe('kafka', () => {
  const kafkaHost = 'kafka:9000'

  let disconnectStub: jest.Mock
  let kafkaAdminStub: Record<string, jest.Mock>
  let kafkaAdminConstructorStub: jest.Mock

  beforeEach(() => {
    resetKafkaAdmin()
    sandbox.stub(config.dotfile, 'getConfig').mockReturnValue({ kafkaHost })
    disconnectStub = sandbox.stub()
    kafkaAdminStub = { disconnect: disconnectStub }
    kafkaAdminConstructorStub = sandbox.stub().mockReturnValue(kafkaAdminStub)
    sandbox.stub(kafkajs, 'Kafka').mockReturnValue({ admin: kafkaAdminConstructorStub })
  })

  describe('#connect', () => {
    it('uses config.kafkaHost when exists', async () => {
      await subject.connect()

      expect(config.dotfile.getConfig).toHaveBeenCalled()
      expect(kafkajs.Kafka).toHaveBeenCalledWith(expect.objectContaining({ brokers: [kafkaHost] }))
    })

    it('prompts to input Kafka host when config.kafkaHost is null', async () => {
      sandbox.stub(config.dotfile, 'getConfig').mockReturnValue({})
      when(sandbox.stub(inquirer, 'prompt'))
        .calledWith(expect.objectContaining({ name: 'kafkaHost' })).mockResolvedValue({ kafkaHost })

      await subject.connect()

      expect(config.dotfile.getConfig).toHaveBeenCalled()
      expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'kafkaHost' }))
    })

    it('returns Kafka client/admin with kafka host', async () => {
      const actual = await subject.connect()

      expect(kafkajs.Kafka).toHaveBeenCalledWith(expect.objectContaining({ brokers: [kafkaHost] }))
      expect(kafkaAdminConstructorStub).toHaveBeenCalled()
      expect(actual).toEqual(kafkaAdminStub)
    })

    it('does not create admin twice', async () => {
      await subject.connect()
      const actual = await subject.connect()

      expect(kafkajs.Kafka).toHaveBeenCalledTimes(1)
      expect(kafkaAdminConstructorStub).toHaveBeenCalledTimes(1)
      expect(actual).toEqual(kafkaAdminStub)
    })
  })

  describe('#disconnect', () => {
    it('disconnects when kafkaAdmin is not null', async () => {
      await subject.connect()
      await subject.disconnect()

      expect(disconnectStub).toHaveBeenCalled()
    })

    it('does not disconnect when kafkaAdmin is null', async () => {
      await subject.disconnect()

      expect(disconnectStub).not.toHaveBeenCalled()
    })
  })
})
