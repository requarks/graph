const knex = require('knex')

/* global GR */

module.exports = () => {
  return knex({
    client: 'pg',
    connection: GR.conf.db
  })
}
