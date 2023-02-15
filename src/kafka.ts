import { Arguments } from 'yargs'
import { Admin, Kafka, logLevel } from 'kafkajs'
import { awsIamAuthenticator, Type as AwsIamAuthType } from '@jm18457/kafkajs-msk-iam-authentication-mechanism'

import config, { ConfigKey } from './config'

let kafkaAdmin: Admin | null = null

const connect = async (argv: Arguments) => {
  if (!kafkaAdmin) {
    const kafkaAuth = await config.get({ configKey: ConfigKey.KafkaAuth, argv })
    const kafkaHost = await config.get({ configKey: ConfigKey.KafkaHost, argv })

    const authConfig = kafkaAuth === KafkaAuthType.IAM
      ? { ssl: true, sasl: { mechanism: AwsIamAuthType, authenticationProvider: awsIamAuthenticator('us-west-2') } }
      : {}

    const kafkaClient = new Kafka({
      brokers: [kafkaHost],
      logLevel: logLevel.NOTHING,
      ...authConfig
    })
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

export enum KafkaAuthType {
  None = 'none',
  IAM = 'IAM'
}
