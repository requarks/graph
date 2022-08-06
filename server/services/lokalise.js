const request = require('request-promise')
const _ = require('lodash')

/* global GR */

module.exports = {
  http: request.defaults({
    baseUrl: GR.conf.api.lokalise.host,
    timeout: 10000,
    json: true
  }),
  async getLanguages () {
    try {
      const resp = await this.http.get({
        url: '/languages',
        headers: {
          'x-api-token': _.sample(GR.conf.api.lokalise.keys)
        },
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
      let hasMoreKeys = false
      let keysPage = 1
      const keys = []
      do {
        const resp = await this.http.get({
          url: '/keys',
          headers: {
            'x-api-token': _.sample(GR.conf.api.lokalise.keys)
          },
          qs: {
            include_translations: 1,
            filter_translation_lang_ids: `${code}`,
            limit: 500,
            page: keysPage
          },
          json: true,
          resolveWithFullResponse: true
        })
        keys.push(...resp.body.keys)
        hasMoreKeys = parseInt(resp.headers['x-pagination-total-count']) > keys.length
        keysPage++
      } while (hasMoreKeys)
      return keys
    } catch (err) {
      throw new Error(err.message)
    }
  },
  async getContributors (code) {
    try {
      const resp = await this.http.get({
        url: '/contributors',
        headers: {
          'x-api-token': _.sample(GR.conf.api.lokalise.keys)
        },
        qs: {
          limit: 5000
        },
        json: true
      })
      return _.get(resp, 'contributors', [])
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
