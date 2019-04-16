const request = require('request-promise')
const _ = require('lodash')

/* global GR */

module.exports = {
  http: request.defaults({
    baseUrl: GR.conf.api.lokalise.host,
    timeout: 10000,
    headers: {
      'x-api-token': GR.conf.api.lokalise.key
    },
    json: true
  }),
  async getLanguages () {
    try {
      let resp = await this.http.get({
        url: '/languages',
        qs: {
          limit: 5000
        },
        json: true
      })
      return _.get(resp, 'languages', [])
    } catch (err) {
      throw new Error(err.message)
    }
  },
  async getStrings (code) {
    try {
      let resp = await this.http.get({
        url: '/keys',
        qs: {
          include_translations: 1,
          filter_translation_lang_ids: `${code}`,
          limit: 5000
        },
        json: true
      })
      return _.get(resp, `keys`, [])
    } catch (err) {
      throw new Error(err.message)
    }
  },
  async getContributors (code) {
    try {
      let resp = await this.http.get({
        url: '/contributors',
        qs: {
          limit: 5000
        },
        json: true
      })
      return _.get(resp, `contributors`, [])
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
