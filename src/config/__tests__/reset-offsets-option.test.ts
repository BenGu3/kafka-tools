import inquirer from 'inquirer'
import { when } from 'jest-when'

import sandbox from '../../../test/sandbox'
import { Scenario, testScenario } from '../test/scenario'
import { ConfigKey } from '../index'
import { ResetOffsetOption } from '../../commands/consumer-commands/reset-offsets'

describe('#config/resetOffsetsOption', () => {
  const resetOffsetsOption = ResetOffsetOption.Earliest
  const resetTimestamp = new Date()
  const scenarios: Scenario[] = [
    {
      name: 'it uses argv.earliest when given',
      params: {
        configKey: ConfigKey.ResetOffsetsOption,
        argv: { interactive: false, earliest: true }
      },
      config: { resetOffsetsOption: 'whatever' },
      expect: actual => {
        expect(actual).toEqual(ResetOffsetOption.Earliest)
      }
    },
    {
      name: 'it uses argv.latest when given',
      params: {
        configKey: ConfigKey.ResetOffsetsOption,
        argv: { interactive: false, latest: true }
      },
      config: { resetOffsetsOption: 'whatever' },
      expect: actual => {
        expect(actual).toEqual(ResetOffsetOption.Latest)
      }
    },
    {
      name: 'it uses argv.timestamp when given',
      params: {
        configKey: ConfigKey.ResetOffsetsOption,
        argv: { interactive: false, timestamp: resetTimestamp }
      },
      config: { resetOffsetsOption: 'whatever' },
      expect: actual => {
        expect(actual).toEqual(resetTimestamp)
      }
    },
    {
      name: 'it ignores config when isDotfileConfigurable is false and no argv',
      stub: () => {
        when(sandbox.stub(inquirer, 'prompt'))
          .calledWith(expect.objectContaining({ name: 'resetOffsetsOption' })).mockResolvedValue({ resetOffsetsOption })
      },
      params: {
        configKey: ConfigKey.ResetOffsetsOption,
        argv: { interactive: true }
      },
      config: { resetOffsetsOption: 'this-shouldnt-be-here!!' },
      expect: actual => {
        expect(actual).toEqual(resetOffsetsOption)
      }
    },
    {
      name: 'it prompts and returns resetOffsetsOption when interactive and no argv.resetOffsetsOption',
      stub: () => {
        when(sandbox.stub(inquirer, 'prompt'))
          .calledWith(expect.objectContaining({ name: 'resetOffsetsOption' })).mockResolvedValue({ resetOffsetsOption })
      },
      params: {
        configKey: ConfigKey.ResetOffsetsOption,
        argv: { interactive: true }
      },
      config: {},
      expect: actual => {
        expect(actual).toEqual(resetOffsetsOption)
        expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'resetOffsetsOption' }))
      }
    },
    {
      name: 'it prompts and returns resetTimestamp when interactive, resetOffsetsOption is Timestamp, and no argv.resetOffsetsOption',
      stub: () => {
        when(sandbox.stub(inquirer, 'prompt'))
          .calledWith(expect.objectContaining({ name: 'resetOffsetsOption' })).mockResolvedValue({ resetOffsetsOption: ResetOffsetOption.Timestamp })
          .calledWith(expect.objectContaining({ name: 'resetTimestamp' })).mockResolvedValue({ resetTimestamp })
      },
      params: {
        configKey: ConfigKey.ResetOffsetsOption,
        argv: { interactive: true }
      },
      config: {},
      expect: actual => {
        expect(actual).toEqual(resetTimestamp)
        expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'resetOffsetsOption' }))
        expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'resetTimestamp' }))
      }
    },
    {
      name: 'it throws when not interactive and no argv.resetOffsetsOption',
      params: {
        configKey: ConfigKey.ResetOffsetsOption,
        argv: { interactive: false }
      },
      config: {},
      expectReject: promise => {
        return expect(promise).rejects.toThrow(`Missing 'resetOffsetsOption'.`)
      }
    }
  ]

  scenarios.forEach(testScenario)
})
