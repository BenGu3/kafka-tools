#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import inquirer from 'inquirer'

import getKafkaAdmin from './get-kafka-admin'

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
inquirer.registerPrompt('date', require('inquirer-date-prompt'))

const parser = yargs(hideBin(process.argv))
  .commandDir('commands', { extensions: ['js', 'ts'] })
  .demandCommand()
  .strict()
  .alias({ h: 'help', v: 'version' })
  .argv

async function main() {
  await parser

  const kafkaAdmin = await getKafkaAdmin()
  await kafkaAdmin.disconnect()
}

main()
  .catch(console.error)
