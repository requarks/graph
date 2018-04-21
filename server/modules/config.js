const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

module.exports = (opts = {}) => {
  const confPaths = {
    base: process.cwd(),
    config: path.join(process.cwd(), 'conf/config.yml'),
    configLocal: '/conf/config-local.yml'
  }

  if (global.DEV || opts.dev) {
    confPaths.configLocal = path.join(process.cwd(), 'conf/config-local.yml')
  } else if (global.TEST || opts.test) {
    confPaths.configLocal = path.join(process.cwd(), 'conf/config-test.yml')
  }

  let conf = {}
  let confLocal = {}

  // Load and parse YAML

  try {
    conf = yaml.safeLoad(fs.readFileSync(confPaths.config, 'utf8'))
    confLocal = yaml.safeLoad(fs.readFileSync(confPaths.configLocal, 'utf8'))
  } catch (ex) {
    console.error(ex)
    process.exit(1)
  }

  // Merge with defaults

  conf = _.defaultsDeep(confLocal, conf)

  // Set dynamic configs

  conf.base = path.resolve(process.cwd(), 'server')
  conf.dev = global.DEV || opts.dev
  conf.test = global.TEST || opts.test

  return conf
}
