const request = require('request-promise')
const _ = require('lodash')

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
  },
  async getStars () {
    try {
      const resp = await this.http.get({
        url: '/repos/requarks/wiki',
        json: true
      })
      return _.get(resp, 'stargazers_count', 4200)
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
