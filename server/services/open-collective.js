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
      let hasMoreBackers = false
      let offset = 0
      const backers = []
      do {
        const resp = await this.http.get({
          qs: {
            offset
          },
          json: true,
          resolveWithFullResponse: true
        })
        backers.push(...resp.body)
        hasMoreBackers = resp.body.length > 0
        offset += 100
      } while (hasMoreBackers)
      return _.filter(backers || [], ['role', 'BACKER'])
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
