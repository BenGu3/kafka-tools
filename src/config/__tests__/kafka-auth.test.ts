import inquirer from 'inquirer'
import { when } from 'jest-when'

import sandbox from '../../../test/sandbox'
import { Scenario, testScenario } from '../test/scenario'
import { ConfigKey } from '../index'
import { KafkaAuthType } from '../../kafka'

describe('config/kafkaAuth', () => {
  const kafkaAuth = KafkaAuthType.None
  const scenarios: Scenario[] = [
    {
      name: 'it uses argv.kafkaAuth when given',
      params: {
        configKey: ConfigKey.KafkaAuth,
        argv: { interactive: false, kafkaAuth }
      },
      config: { kafkaAuth: 'bad-auth' },
      expect: actual => {
        expect(actual).toEqual(kafkaAuth)
      }
    },
    {
      name: 'it uses config.kafkaAuth when given and no argv.kafkaAuth',
      params: {
        configKey: ConfigKey.KafkaAuth,
        argv: { interactive: false }
      },
      config: { kafkaAuth },
      expect: actual => {
        expect(actual).toEqual(kafkaAuth)
      }
    },
    {
      name: 'it prompts and returns kafkaAuth when interactive and no argv.kafkaAuth/config.kafkaAuth',
      stub: () => {
        when(sandbox.stub(inquirer, 'prompt'))
          .calledWith(expect.objectContaining({ name: 'kafkaAuth' })).mockResolvedValue({ kafkaAuth })
      },
      params: {
        configKey: ConfigKey.KafkaAuth,
        argv: { interactive: true }
      },
      config: {},
      expect: actual => {
        expect(actual).toEqual(kafkaAuth)
        expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'kafkaAuth' }))
      }
    },
    {
      name: 'it throws when not interactive and no argv.kafkaAuth/config.kafkaAuth',
      params: {
        configKey: ConfigKey.KafkaAuth,
        argv: { interactive: false }
      },
      config: {},
      expectReject: promise => {
        return expect(promise).rejects.toThrow(`Missing 'kafkaAuth'.`)
      }
    }
  ]

  scenarios.forEach(testScenario)
})
