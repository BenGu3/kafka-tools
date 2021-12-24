import inquirer from 'inquirer'
import { Admin, Kafka } from 'kafkajs'

let kafkaAdmin: Admin | null = null

const getKafkaAdmin = async () => {
  if (!kafkaAdmin) {
    const { kafkaHost } = await inquirer.prompt<{ kafkaHost: string }>({
      name: 'kafkaHost',
      message: 'What is your Kafka host?',
      type: 'input'
    })

    const kafkaClient = new Kafka({ brokers: [kafkaHost] })
    kafkaAdmin = kafkaClient.admin()
  }

  return kafkaAdmin
}

export const resetKafkaAdmin = () => { kafkaAdmin = null }

export default getKafkaAdmin