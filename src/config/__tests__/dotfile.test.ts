import fs from 'fs'

import * as subject from '../dotfile'
import sandbox from '../../../test/sandbox'
import { ConfigKey } from '../config-key'

describe('config/dotfile', () => {
  const testConfig = {
    firstConfig: '1',
    secondConfig: '2'
  }

  beforeEach(async () => {
    subject.resetLocalDotfile()
    sandbox.stub(fs, 'existsSync').mockReturnValue(true)
    sandbox.stub(fs, 'readFileSync').mockReturnValue(JSON.stringify(testConfig))
    sandbox.stub(fs, 'writeFileSync')
  })

  describe('#getDotfileConfig', () => {
    it('creates the config file if it does not exist', async () => {
      sandbox.stub(fs, 'existsSync').mockReturnValue(false)
      sandbox.stub(fs, 'readFileSync').mockReturnValue(JSON.stringify({}))

      const actual = await subject.getDotfileConfig()

      expect(actual).toEqual({})
      expect(fs.existsSync).toHaveBeenCalledWith(subject.dotfilePath)
      expect(fs.writeFileSync).toHaveBeenCalledWith(subject.dotfilePath, '{}')
    })

    it('returns the config', async () => {
      const actual = await subject.getDotfileConfig()

      expect(actual).toEqual(testConfig)
      expect(fs.existsSync).toHaveBeenCalledWith(subject.dotfilePath)
    })
  })

  describe('#set', () => {
    it('sets a new key/value on local config and writes to config file', async () => {
      const key = ConfigKey.KafkaHost
      const value = 'newValue'
      const expected = { ...testConfig, [key]: value }

      subject.set({ key, value })
      const actual = await subject.getDotfileConfig()

      expect(actual).toEqual(expected)
      expect(fs.writeFileSync).toHaveBeenCalledWith(subject.dotfilePath, JSON.stringify(expected, null, 2))
    })
  })

  describe('#unset', () => {
    it('deletes key from local config and writes to config file', async () => {
      const key = 'firstConfig'
      const expected = { secondConfig: '2' }

      subject.unset(key as ConfigKey)
      const actual = await subject.getDotfileConfig()

      expect(actual).toEqual(expected)
      expect(fs.writeFileSync).toHaveBeenCalledWith(subject.dotfilePath, JSON.stringify(expected, null, 2))
    })
  })
})
