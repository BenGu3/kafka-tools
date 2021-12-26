import sandbox from '../../../test/sandbox'
import * as config from '../../config'
import { handler, setHandler, unsetHandler } from '../config'

describe('commands/config', () => {
  beforeEach(() => {
    sandbox.stub(console, 'log')
    sandbox.stub(config, 'set')
    sandbox.stub(config, 'unset')
  })

  it('logs out config when no options are passed', async () => {
    await handler()

    expect(console.log).toHaveBeenCalledWith(expect.any(String))
  })

  it('sets config key and value when set command', async () => {
    const key = 'kafkaHost'
    const value = 'kafka:9002'

    await setHandler({ key, value } as any)

    expect(config.set).toHaveBeenCalledWith({ key, value })
  })

  it('unsets config key when unset command', async () => {
    const key = 'kafkaHost'

    await unsetHandler({ key } as any)

    expect(config.unset).toHaveBeenCalledWith(key)
  })
})
