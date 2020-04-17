'use strict'

// ===========================================
// REQUARKS GRAPH API
// ===========================================

const path = require('path')
const cluster = require('cluster')
const semver = require('semver')
const packageJSON = require(path.join(process.cwd(), 'package.json'))
const _ = require('lodash')

// ----------------------------------------
// Check prerequisites
// ----------------------------------------

if (!semver.satisfies(process.version, packageJSON.engines.node)) {
  console.error(`[ERROR] Invalid Node.js version! ${packageJSON.engines.node} required.`)
  process.exit(1)
}

// ----------------------------------------
// Get Runtime Arguments
// ----------------------------------------

const args = require('yargs')
  .option('d', {
    alias: 'dev',
    describe: 'Dev mode',
    default: false,
    type: 'boolean'
  })
  .option('t', {
    alias: 'test',
    describe: 'Test mode',
    default: false,
    type: 'boolean'
  })
  .help('h')
  .alias('h', 'help').argv

global.DEV = args.dev
global.TEST = args.test
global.PROD = !(args.dev || args.test)

// ----------------------------------------
// Set Root Object
// ----------------------------------------

const GR = {
  IS_MASTER: cluster.isMaster,
  ROOTPATH: process.cwd(),
  SERVERPATH: path.join(process.cwd(), 'server'),
  Error: require('./modules/errors'),
  conf: require('./modules/config')({ dev: args.dev })
}
global.GR = GR

// ----------------------------------------
// Init Logger
// ----------------------------------------

GR.logger = require('./modules/logger')({ dev: args.dev })

// ----------------------------------------
// Start Cluster
// ----------------------------------------

if (cluster.isMaster) {
  GR.logger.info('=======================================')
  GR.logger.info('= REQUARKS GRAPH API ==================')
  GR.logger.info('=======================================')

  require('./master')().then(() => {
    _.times(1, cluster.fork)
  })

  cluster.on('exit', (worker, code, signal) => {
    GR.logger.info('Worker was terminated.')
  })
} else {
  switch (cluster.worker.id) {
    case 1:
      GR.logger.info('---------------------------------------')
      GR.logger.info('Worker {scheduler-apis} is initializing...')
      require('./worker-scheduled-apis')
      break
  }
}
