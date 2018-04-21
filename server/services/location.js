const request = require('request-promise')

/* global GR */

module.exports = {
  http: request.defaults({
    baseUrl: GR.conf.api.location.host,
    timeout: 10000,
    json: true
  }),
  async getCountries () {
    try {
      let resp = await this.http.get({
        url: '/all',
        qs: {
          fields: 'name;alpha2Code;alpha3Code;region;subregion;demonym;timezones;nativeName;languages'
        },
        json: true
      })
      return resp
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
