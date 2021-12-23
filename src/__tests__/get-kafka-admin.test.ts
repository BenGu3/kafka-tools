import inquirer from 'inquirer'
import * as kafkajs from 'kafkajs'
import { when } from 'jest-when'

import subject, { resetKafkaAdmin } from '../get-kafka-admin'
import sandbox from '../../test/sandbox'

jest.mock('kafkajs')

describe('get-kafka-admin', () => {
  const kafkaHost = 'kafka:9000'

  let kafkaAdminStub: any
  let kafkaAdminConstructorStub: jest.Mock

  beforeEach(() => {
    resetKafkaAdmin()
    when(sandbox.stub(inquirer, 'prompt'))
      .calledWith(expect.objectContaining({ name: 'kafkaHost' })).mockResolvedValue({ kafkaHost })
    kafkaAdminStub = { fetchOffsets: sandbox.stub() }
    kafkaAdminConstructorStub = sandbox.stub().mockReturnValue(kafkaAdminStub)
    sandbox.stub(kafkajs, 'Kafka').mockReturnValue({ admin: kafkaAdminConstructorStub })
  })

  it('prompts to input Kafka host', async () => {
    await subject()

    expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'kafkaHost' }))
  })

  it('returns Kafka client/admin with kafka host', async () => {
    const actual = await subject()

    expect(kafkajs.Kafka).toHaveBeenCalledWith({ brokers: [kafkaHost] })
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
