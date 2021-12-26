#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import inquirer from 'inquirer'

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
inquirer.registerPrompt('date', require('inquirer-date-prompt'))

// eslint-disable-next-line no-void
void yargs(hideBin(process.argv))
  .commandDir('commands')
  .demandCommand()
  .strict()
  .alias({ h: 'help', v: 'version' })
  .argv
