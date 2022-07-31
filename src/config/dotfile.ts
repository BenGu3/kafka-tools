import path from 'path'
import os from 'os'
import fs from 'fs'

import { Config } from './index'
import { ConfigKey } from './config-key'

export const dotfilePath = path.join(os.homedir(), '.kafka-tools')

let dotfile: Config | null = null

const initDotfile = () => {
  if (dotfile) return

  if (!fs.existsSync(dotfilePath))
    fs.writeFileSync(dotfilePath, JSON.stringify({}))

  dotfile = JSON.parse(fs.readFileSync(dotfilePath) as any)
}

export const getDotfileConfig = (): Config | null => {
  initDotfile()

  return dotfile
}

export const set = (params: { key: ConfigKey, value: string }) => {
  initDotfile()

  const { key, value } = params
  dotfile = { ...dotfile, [key]: value }

  fs.writeFileSync(dotfilePath, JSON.stringify(dotfile, null, 2))
}

export const unset = (key: ConfigKey) => {
  initDotfile()

  if (!dotfile || !(key in dotfile)) return
  delete dotfile[key]

  fs.writeFileSync(dotfilePath, JSON.stringify(dotfile, null, 2))
}

export const resetLocalDotfile = () => {
  dotfile = null
}
