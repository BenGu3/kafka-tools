import inquirer from 'inquirer'
import * as kafkajs from 'kafkajs'
import { when } from 'jest-when'

import subject, { resetKafkaAdmin } from '../get-kafka-admin'
import sandbox from '../../test/sandbox'
import config from '../config'

jest.mock('kafkajs')

describe('get-kafka-admin', () => {
  const kafkaHost = 'kafka:9000'

  let kafkaAdminStub: any
  let kafkaAdminConstructorStub: jest.Mock

  beforeEach(() => {
    resetKafkaAdmin()
    sandbox.stub(config.dotfile, 'getConfig').mockReturnValue({ kafkaHost })
    kafkaAdminStub = { fetchOffsets: sandbox.stub() }
    kafkaAdminConstructorStub = sandbox.stub().mockReturnValue(kafkaAdminStub)
    sandbox.stub(kafkajs, 'Kafka').mockReturnValue({ admin: kafkaAdminConstructorStub })
  })

  it('uses config.kafkaHost when exists', async () => {
    await subject()

    expect(config.dotfile.getConfig).toHaveBeenCalled()
    expect(kafkajs.Kafka).toHaveBeenCalledWith(expect.objectContaining({ brokers: [kafkaHost] }))
  })

  it('prompts to input Kafka host when config.kafkaHost is null', async () => {
    sandbox.stub(config.dotfile, 'getConfig').mockReturnValue({})
    when(sandbox.stub(inquirer, 'prompt'))
      .calledWith(expect.objectContaining({ name: 'kafkaHost' })).mockResolvedValue({ kafkaHost })

    await subject()

    expect(config.dotfile.getConfig).toHaveBeenCalled()
    expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'kafkaHost' }))
  })

  it('returns Kafka client/admin with kafka host', async () => {
    const actual = await subject()

    expect(kafkajs.Kafka).toHaveBeenCalledWith(expect.objectContaining({ brokers: [kafkaHost] }))
    expect(kafkaAdminConstructorStub).toHaveBeenCalled()
    expect(actual).toEqual(kafkaAdminStub)
  })

  it('does not create admin twice', async () => {
    await subject()
    const actual = await subject()

    expect(kafkajs.Kafka).toHaveBeenCalledTimes(1)
    expect(kafkaAdminConstructorStub).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(kafkaAdminStub)
  })
})
