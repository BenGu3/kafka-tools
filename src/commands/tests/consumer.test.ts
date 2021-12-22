import inquirer from 'inquirer'
import * as kafkajs from 'kafkajs'

import { handler } from '../consumer'
import sandbox from '../../../test/sandbox'

jest.mock('kafkajs')

describe('commands/consumer', () => {
  const kafkaHost = 'kafka:9000'
  const groups = [{ groupId: 'group-one' }, { groupId: 'group-two' }]

  let listGroupsStub: jest.Mock
  let kafkaAdminStub: jest.Mock

  beforeEach(() => {
    sandbox.stub(inquirer, 'prompt').mockResolvedValue({ kafkaHost })
    listGroupsStub = sandbox.stub().mockResolvedValue({ groups })
    kafkaAdminStub = sandbox.stub().mockReturnValue({ listGroups: listGroupsStub })
    sandbox.stub(kafkajs, 'Kafka').mockReturnValue({ admin: kafkaAdminStub })
  })

  it('prompts for Kafka host', async () => {
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

  it('prompts with list consumer groups', async () => {
    await handler()

    expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'consumerGroup' }))
  })
})
