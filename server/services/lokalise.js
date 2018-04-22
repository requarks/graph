const request = require('request-promise')
const _ = require('lodash')

/* global GR */

module.exports = {
  http: request.defaults({
    baseUrl: GR.conf.api.lokalise.host,
    timeout: 10000,
    qs: {
      api_token: GR.conf.api.lokalise.key,
      id: GR.conf.api.lokalise.projectId
    },
    form: {
      api_token: GR.conf.api.lokalise.key,
      id: GR.conf.api.lokalise.projectId
    },
    json: true
  }),
  async getLanguages () {
    try {
      let resp = await this.http.get({
        url: '/language/list',
        json: true
      })
      return _.get(resp, 'languages', [])
    } catch (err) {
      throw new Error(err.message)
    }
  },
  async getStrings (code) {
    try {
      let resp = await this.http.post({
        url: '/string/list',
        form: {
          langs: `['${code}']`
        },
        json: true
      })
      return _.get(resp, `strings.${code}`, [])
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
