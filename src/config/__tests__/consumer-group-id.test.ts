import inquirer from 'inquirer'
import { when } from 'jest-when'

import sandbox from '../../../test/sandbox'
import { Scenario, testScenario } from '../test/scenario'
import { ConfigKey } from '../config-key'

describe('#config/consumerGroupId', () => {
  const consumerGroupId = 'some-consumer'
  const consumerGroupIds = ['cg1', 'cg2', 'cg3']
  const scenarios: Scenario[] = [
    {
      name: 'it uses argv.consumerGroupId when given',
      params: {
        configKey: ConfigKey.ConsumerGroupId,
        argv: { interactive: false, consumerGroupId },
        consumerGroupIds
      },
      config: { consumerGroupId: 'bad-consumer' },
      expect: actual => {
        expect(actual).toEqual(consumerGroupId)
      }
    },
    {
      name: 'it uses config.consumerGroupId when given and no argv.consumerGroupId',
      params: {
        configKey: ConfigKey.ConsumerGroupId,
        argv: { interactive: false },
        consumerGroupIds
      },
      config: { consumerGroupId },
      expect: actual => {
        expect(actual).toEqual(consumerGroupId)
      }
    },
    {
      name: 'it prompts and returns consumerGroupId when interactive and no argv.consumerGroupId/config.consumerGroupId',
      stub: () => {
        when(sandbox.stub(inquirer, 'prompt'))
          .calledWith(expect.objectContaining({ name: 'consumerGroupId' })).mockResolvedValue({ consumerGroupId })
      },
      params: {
        configKey: ConfigKey.ConsumerGroupId,
        argv: { interactive: true },
        consumerGroupIds
      },
      config: {},
      expect: actual => {
        expect(actual).toEqual(consumerGroupId)
        expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'consumerGroupId' }))
      }
    },
    {
      name: 'it throws when not interactive and no argv.consumerGroupId/config.consumerGroupId',
      params: {
        configKey: ConfigKey.ConsumerGroupId,
        argv: { interactive: false },
        consumerGroupIds
      },
      config: {},
      expectReject: promise => {
        return expect(promise).rejects.toThrow(`Missing 'consumerGroupId'.`)
      }
    }
  ]

  scenarios.forEach(testScenario)
})
