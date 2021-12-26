import path from 'path'
import os from 'os'
import fs from 'fs'

export const configFilePath = path.join(os.homedir(), '.kafka-tools')
export enum ConfigKey {
  KafkaHost = 'kafkaHost'
}

let config: Partial<Record<ConfigKey, string>> | null = null

const initConfig = () => {
  if (config) return

  if (!fs.existsSync(configFilePath))
    fs.writeFileSync(configFilePath, JSON.stringify({}))

  config = JSON.parse(fs.readFileSync(configFilePath) as any)
}

export const getConfig = () => {
  initConfig()

  return config
}

export const set = (params: { key: ConfigKey, value: string }) => {
  initConfig()

  const { key, value } = params
  config = { ...config, [key]: value }

  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2))
}

export const unset = (key: ConfigKey) => {
  initConfig()

  if (!config || !(key in config)) return
  delete config[key]

  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2))
}

export const resetLocalConfig = () => {
  config = null
}
