import { Arguments } from 'yargs'
import { Admin, Kafka, logLevel } from 'kafkajs'

import config, { ConfigKey } from './config'

let kafkaAdmin: Admin | null = null

const connect = async (argv: Arguments) => {
  if (!kafkaAdmin) {
    const kafkaHost = await config.get({ configKey: ConfigKey.KafkaHost, argv })
    const kafkaClient = new Kafka({ brokers: [kafkaHost], logLevel: logLevel.NOTHING })
    kafkaAdmin = kafkaClient.admin()
  }

  return kafkaAdmin
}

const disconnect = async () => kafkaAdmin && await kafkaAdmin.disconnect()

export const resetKafkaAdmin = () => { kafkaAdmin = null }

export default {
  connect,
  disconnect
}
