const request = require('request-promise')

/* global GR */

module.exports = {
  http: request.defaults({
    baseUrl: GR.conf.api.patreon.host,
    timeout: 10000,
    headers: {
      'Authorization': `Bearer ${GR.conf.api.patreon.accessToken}`
    },
    json: true
  }),
  async getPatrons () {
    try {
      let resp = await this.http.get({
        url: '/campaigns/2394538/pledges',
        qs: {
          include: 'patron.null'
        },
        json: true
      })
      return resp || {
        data: [],
        included: []
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
