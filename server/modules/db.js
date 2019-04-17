const knex = require('knex')
const _ = require('lodash')

/* global GR */

module.exports = () => {
  return knex({
    client: 'pg',
    connection: GR.conf.db
  })
}
