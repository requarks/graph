const Redis = require('ioredis')
const _ = require('lodash')

/* global GR */

module.exports = () => {
  return new Redis(_.defaultsDeep(GR.conf.redis, {
    error: (err) => {
      GR.logger.error(err)
    }
  }))
}
