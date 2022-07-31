import inquirer from 'inquirer'
import { when } from 'jest-when'

import sandbox from '../../../test/sandbox'
import { Scenario, testScenario } from '../test/scenario'
import { ConfigKey } from '../config-key'

describe('config/topic', () => {
  const topic = 'some-topic'
  const topics = ['t1', 't2', 't3']
  const scenarios: Scenario[] = [
    {
      name: 'it uses argv.topic when given',
      params: {
        configKey: ConfigKey.Topic,
        argv: { interactive: false, topic },
        topics
      },
      config: { topic: 'bad-topic' },
      expect: actual => {
        expect(actual).toEqual(topic)
      }
    },
    {
      name: 'it uses config.topic when given and no argv.topic',
      params: {
        configKey: ConfigKey.Topic,
        argv: { interactive: false },
        topics
      },
      config: { topic },
      expect: actual => {
        expect(actual).toEqual(topic)
      }
    },
    {
      name: 'it prompts and returns topic when interactive and no argv.topic/config.topic',
      stub: () => {
        when(sandbox.stub(inquirer, 'prompt'))
          .calledWith(expect.objectContaining({ name: 'topic' })).mockResolvedValue({ topic })
      },
      params: {
        configKey: ConfigKey.Topic,
        argv: { interactive: true },
        topics
      },
      config: {},
      expect: actual => {
        expect(actual).toEqual(topic)
        expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'topic' }))
      }
    },
    {
      name: 'it throws when not interactive and no argv.topic/config.topic',
      params: {
        configKey: ConfigKey.Topic,
        argv: { interactive: false },
        topics
      },
      config: {},
      expectReject: promise => {
        return expect(promise).rejects.toThrow(`Missing 'topic'.`)
      }
    }
  ]

  scenarios.forEach(testScenario)
})
