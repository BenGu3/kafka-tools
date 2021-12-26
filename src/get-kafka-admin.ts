import inquirer from 'inquirer'
import { Admin, Kafka, logLevel } from 'kafkajs'

import { getConfig } from './config'

let kafkaAdmin: Admin | null = null

const getKafkaAdmin = async () => {
  if (!kafkaAdmin) {
    const kafkaHost = await getKafkaHost()
    const kafkaClient = new Kafka({ brokers: [kafkaHost], logLevel: logLevel.NOTHING })
    kafkaAdmin = kafkaClient.admin()
  }

  return kafkaAdmin
}

const getKafkaHost = async (): Promise<string> => {
  const config = getConfig()
  if (config?.kafkaHost) {
    return config.kafkaHost
  }

  const { kafkaHost } = await inquirer.prompt<{ kafkaHost: string }>({
    name: 'kafkaHost',
    message: 'What is your Kafka host?',
    type: 'input'
  })

  return kafkaHost
}

export const resetKafkaAdmin = () => { kafkaAdmin = null }

export default getKafkaAdmin
