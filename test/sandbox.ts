import { ModuleMocker } from 'jest-mock'

import Mock = jest.Mock
import Spy = jest.SpyInstance

class TestSandbox {
  jestMocker: ModuleMocker
  jestStubs: Mock[]
  jestSpies: Spy[]

  constructor() {
    this.jestMocker = new ModuleMocker(global)
    this.jestStubs = []
    this.jestSpies = []
  }

  stub(): Mock
  stub<T>(module: T, functionName: keyof T): Mock
  stub<T>(module?: T, functionName?: keyof T): Mock {
    const mock = this.jestMocker.fn() as Mock
    if (!module || !functionName)
      return mock
    mock.mockName(functionName as string)

    const currentFn = (module as any)[functionName] as Mock
    if (this.isStub(currentFn)) {
      currentFn.mockReset()
      return currentFn
    }

    const originalDescriptor = getFunctionDescriptor(module, functionName)
    if (!originalDescriptor)
      throw new Error(`Cannot stub function "${functionName}". It does not exist.`)

    Object.defineProperty(module, functionName, { value: mock, configurable: true, writable: true })

    this.jestStubs.push(mock)

    mock.mockRestore = () => Object.defineProperty(module, functionName, originalDescriptor)

    return mock
  }

  spyOn<T>(module: T, functionName: keyof T) {
    const spy = this.jestMocker.spyOn(module, functionName as any) as unknown as Spy

    this.jestSpies.push(spy)

    return spy
  }

  isStub(func: any): func is Mock {
    return this.jestMocker.isMockFunction(func)
  }

  resetStub<T>(module: T, functionName: keyof T) {
    this.stub(module, functionName).mockReset()
  }

  restore() {
    this.jestStubs.forEach(stub => stub.mockRestore())
    this.jestStubs = []
    this.jestSpies.forEach(stub => stub.mockRestore())
    this.jestSpies = []
  }
}

function getFunctionDescriptor<T>(module: T, functionName: keyof T): PropertyDescriptor | undefined {
  let proto = module
  let descriptor
  while (proto && !(descriptor = Object.getOwnPropertyDescriptor(proto, functionName)))
    proto = Object.getPrototypeOf(proto)

  return descriptor
}

const sandbox = new TestSandbox()

afterEach(() => {
  sandbox.restore()
})

export default sandbox
