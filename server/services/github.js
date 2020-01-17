const request = require('request-promise')
const _ = require('lodash')
const moment = require('moment')

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
  },
  async getSponsors () {
    try {
      const resp = await this.http.post({
        url: '/graphql',
        json: true,
        auth: {
          bearer: GR.conf.api.github.token
        },
        body: {
          query: 'query { \n  user(login:"ngpixel") {\n    sponsorshipsAsMaintainer(first: 100) {\n      totalCount\n      nodes {\n        createdAt\n        sponsor {\n          id\n          login\n          name\n          avatarUrl\n          websiteUrl\n        }\n        tier {\n          monthlyPriceInDollars\n        }\n      }\n    }\n  }\n}',
          variables: {}
        }
      })
      return _.get(resp, 'data.user.sponsorshipsAsMaintainer.nodes', []).map(b => {
        const monthly = _.get(b, 'tier.monthlyPriceInDollars', 0)
        let totalAmountDonated = 0
        if (monthly > 0) {
          const createdAt = moment(_.get(b, 'createdAt', false))
          totalAmountDonated = Math.round(Math.ceil(moment.duration(moment().diff(createdAt)).asMonths()) * monthly)
        }
        return {
          id: _.get(b, 'sponsor.id', null),
          name: _.get(b, 'sponsor.name', null),
          login: _.get(b, 'sponsor.login', null),
          avatarUrl: _.get(b, 'sponsor.avatarUrl', null),
          websiteUrl: _.get(b, 'sponsor.websiteUrl', null),
          createdAt: _.get(b, 'createdAt', false),
          totalAmountDonated
        }
      })
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
