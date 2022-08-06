import sandbox from '../../../test/sandbox'
import * as dotfile from '../dotfile'
import subject, { Config } from '../index'
import { Params } from '../helpers'

export const testScenario = (scenario: Scenario) => {
  it(scenario.name, async () => {
    scenario.stub?.()
    sandbox.stub(dotfile, 'getDotfileConfig').mockReturnValue(scenario.config)

    const promise = subject.get(scenario.params as Params)

    if ('expect' in scenario)
      scenario.expect(await promise)
    else if ('expectReject' in scenario)
      await scenario.expectReject(promise)
  })
}

type BaseScenario = {
  name: string
  stub?: () => void
  params: Record<string, unknown>
  config: Config
}

type ResolveScenario = BaseScenario & {
  expect: (actual: any) => void
}

type RejectScenario = BaseScenario & {
  expectReject: (promise: Promise<any>) => Promise<void>
}

export type Scenario = ResolveScenario | RejectScenario
