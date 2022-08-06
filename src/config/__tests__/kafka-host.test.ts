import inquirer from 'inquirer'
import { when } from 'jest-when'

import sandbox from '../../../test/sandbox'
import { Scenario, testScenario } from '../test/scenario'
import { ConfigKey } from '../index'

describe('config/kafkaHost', () => {
  const kafkaHost = 'some-random-host'
  const scenarios: Scenario[] = [
    {
      name: 'it uses argv.kafkaHost when given',
      params: {
        configKey: ConfigKey.KafkaHost,
        argv: { interactive: false, kafkaHost }
      },
      config: { kafkaHost: 'bad-host' },
      expect: actual => {
        expect(actual).toEqual(kafkaHost)
      }
    },
    {
      name: 'it uses config.kafkaHost when given and no argv.kafkaHost',
      params: {
        configKey: ConfigKey.KafkaHost,
        argv: { interactive: false }
      },
      config: { kafkaHost },
      expect: actual => {
        expect(actual).toEqual(kafkaHost)
      }
    },
    {
      name: 'it prompts and returns kafkaHost when interactive and no argv.kafkaHost/config.kafkaHost',
      stub: () => {
        when(sandbox.stub(inquirer, 'prompt'))
          .calledWith(expect.objectContaining({ name: 'kafkaHost' })).mockResolvedValue({ kafkaHost })
      },
      params: {
        configKey: ConfigKey.KafkaHost,
        argv: { interactive: true }
      },
      config: {},
      expect: actual => {
        expect(actual).toEqual(kafkaHost)
        expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'kafkaHost' }))
      }
    },
    {
      name: 'it throws when not interactive and no argv.kafkaHost/config.kafkaHost',
      params: {
        configKey: ConfigKey.KafkaHost,
        argv: { interactive: false }
      },
      config: {},
      expectReject: promise => {
        return expect(promise).rejects.toThrow(`Missing 'kafkaHost'.`)
      }
    }
  ]

  scenarios.forEach(testScenario)
})
