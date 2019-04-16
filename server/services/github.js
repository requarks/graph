const request = require('request-promise')

/* global GR */

module.exports = {
  http: request.defaults({
    baseUrl: GR.conf.api.github.host,
    timeout: 10000,
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Requarks GraphQL'
    },
    json: true
  }),
  async getContributors () {
    try {
      return this.http.get({
        url: '/repos/requarks/wiki/contributors',
        json: true
      })
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
