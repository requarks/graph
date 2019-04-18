const request = require('request-promise')

/* global GR */

module.exports = {
  http: request.defaults({
    baseUrl: GR.conf.api.mailchimp.host,
    timeout: 10000,
    headers: {
      'User-Agent': 'Requarks GraphQL'
    },
    auth: {
      user: 'random',
      pass: GR.conf.api.mailchimp.token
    },
    json: true
  }),
  async subscribe ({ email, name, country }) {
    try {
      return this.http.post({
        url: `/lists/${GR.conf.api.mailchimp.list}/members/`,
        json: true,
        body: {
          email_address: email,
          status: 'pending',
          merge_fields: {
            FNAME: name,
            COUNTRY: country
          },
          location: {
            country_code: country
          }
        }
      })
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
