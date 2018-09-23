/* global GR */

const autoload = require('auto-load')
const Promise = require('bluebird')
const _ = require('lodash')

// ----------------------------------------
// Load global modules
// ----------------------------------------

GR.redis = require('./modules/redis')()
GR.models = autoload('./server/models')
GR.ipc = require('./modules/ipc').init('worker-scheduled-apis')

// ----------------------------------------
// Run tasks
// ----------------------------------------

const CronJob = require('cron').CronJob

let jobHourly = new CronJob({
  cronTime: GR.conf.cron.hourly,
  onTick () {
    return Promise.each([
      () => { return GR.models.location.refreshCountries() },
      () => { GR.logger.debug('All scheduled [APIs][Hourly] tasks completed.') }
    ], fn => fn())
  },
  runOnInit: GR.conf.cron.execOnInit,
  start: false,
  timeZone: 'America/New_York'
})

let jobFrequent = new CronJob({
  cronTime: GR.conf.cron.frequent,
  onTick () {
    return Promise.each([
      () => { return GR.models.localization.refreshLocales() },
      () => { GR.logger.debug('All scheduled [APIs][Frequent] tasks completed.') }
    ], fn => fn())
  },
  runOnInit: GR.conf.cron.execOnInit,
  start: false,
  timeZone: 'America/New_York'
})

_.delay(() => {
  jobHourly.start()
  jobFrequent.start()
  GR.logger.info('Worker {scheduled-apis} state: [ RUNNING ]')
}, 1000)
