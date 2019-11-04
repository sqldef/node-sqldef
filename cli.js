#!/usr/bin/env node

// config order goes cosmic > args

const { cosmiconfig } = require('cosmiconfig')
const Confirm = require('prompt-confirm')
const sqldef = require('./index')

// get a reasonable port
const getPort = args => args.port || ((args.type === 'mysql') ? 3306 : 5432)

const run = async () => {
  const explorer = cosmiconfig('sqldef')
  const r = (await explorer.search()) || { config: {} }
  const { config = {} } = r
  require('yargs')
    .demandCommand()
    .usage('Usage: $0 <command> [options]')
    .help('?')
    .alias('?', 'help')

    .alias('v', 'version')
    .example('$0 export --user=cool --password=mysecret --database=mydatabase', 'Save your current schema, from your mysql database, in schema.sql')
    .example('$0 import --user=cool --password=mysecret --database=mydatabase', 'Save the structure from your currnet database in schema.sql')

    .command('export', 'Export your database to a file', a => {}, async args => {
      args.port = args.port || getPort(args)
      const { file, type, host, database, user, password, socket, port = getPort(args) } = args
      console.log(await sqldef({ file, type, host, database, user, password, socket, port, ...config, get: true }))
    })

    .command('import', 'Import your database from a file', a => {}, async args => {
      const { file, type, host, database, user, password, socket, noConfirm, port = getPort(args) } = args
      if (!noConfirm) {
        console.log(await sqldef({ file, type, host, database, user, password, socket, port, ...config, dry: true }))
        const prompt = new Confirm('Do you want to run this?')
        if (!(await prompt.run())) {
          console.error('Export canceled.')
          process.exit(1)
        }
      }
      console.log(await sqldef({ file, type, host, database, user, password, socket, port, ...config }))
    })

    .option('f', {
      alias: 'file',
      describe: 'The schema file to import/export',
      nargs: 1,
      default: config.file || 'schema.sql'
    })

    .option('t', {
      alias: 'type',
      describe: 'The type of the database',
      nargs: 1,
      default: config.type || 'mysql'
    })

    .option('h', {
      alias: 'host',
      describe: 'The host of the database',
      nargs: 1,
      default: config.host || 'localhost'
    })

    .option('d', {
      alias: 'database',
      describe: 'The name of the database',
      nargs: 1,
      default: config.database || 'test'
    })

    .option('u', {
      alias: 'user',
      describe: 'The user of the database',
      nargs: 1,
      default: config.user || 'root'
    })

    .option('P', {
      alias: 'password',
      describe: 'The password for the database',
      nargs: 1,
      default: config.password || ''
    })

    .option('p', {
      alias: 'port',
      describe: 'The port of the database',
      nargs: 1,
      default: config.port
    })

    .option('s', {
      alias: 'socket',
      describe: 'The socket of the database (only for mysql)',
      nargs: 1,
      default: config.socket
    })

    .option('x', {
      alias: 'no-confirm',
      describe: "Don't confirm before running the import/export",
      type: 'boolean',
      default: config['no-confirm']
    })

    .argv
}
run()
