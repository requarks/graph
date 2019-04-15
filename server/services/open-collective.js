const request = require('request-promise')
const _ = require('lodash')

/* global GR */

module.exports = {
  http: request.defaults({
    uri: GR.conf.api.openCollective.host,
    timeout: 10000,
    json: true
  }),
  async getBackers () {
    try {
      const backers = await this.http.get()
      return _.filter(backers || [], ['role', 'BACKER'])
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
