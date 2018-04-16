const request = require('request-promise')

/* global GR */

module.exports = {
  http: request.defaults({
    baseUrl: GR.conf.api.lokalise.host,
    timeout: 10000,
    form: {
      api_token: GR.conf.api.lokalise.key,
      id: GR.conf.api.lokalise.projectId
    },
    json: true
  })
}
