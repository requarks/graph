/* global GR */

const svcPatreon = require('../services/patreon')
const svcOpenCollective = require('../services/open-collective')
const _ = require('lodash')
const moment = require('moment')

module.exports = {
  /**
   * Get sponsors
   */
  async getSponsors (kind) {
    let sponsors = await GR.redis.get(`sponsors:${kind}`)
    return sponsors ? JSON.parse(sponsors) : []
  },
  /**
   * Refresh all country data from remote source
   */
  async refreshSponsors () {
    GR.logger.debug('Refreshing all sponsors...')

    try {
      // Fetch from Patron
      const patreonData = await svcPatreon.getPatrons()
      let backers = _.map(patreonData.data, b => {
        const usrId = _.get(b, 'relationships.patron.data.id', 0)
        const usr = _.get(_.find(patreonData.included, ['id', usrId]), 'attributes', {})

        return {
          kind: 'BACKER',
          id: `patreon-${usrId}`,
          source: 'Patreon',
          amount: _.get(b, 'attributes.amount_cents', 0),
          joined: _.get(b, 'attributes.created_at', false),
          name: usr.full_name,
          website: usr.url,
          twitter: usr.twitter ? `https://twitter.com/${usr.twitter}` : null,
          extraInfo: '',
          avatar: usr.thumb_url
        }
      })

      // Fetch from OpenCollective
      const openCollectiveData = await svcOpenCollective.getBackers()
      openCollectiveData.forEach(b => {
        backers.push({
          kind: 'BACKER',
          id: `opencollective-${b.MemberId}`,
          source: 'OpenCollective',
          amount: _.get(b, 'totalAmountDonated', 0) * 100,
          joined: moment(_.get(b, 'createdAt', false)).toISOString(),
          name: b.name,
          website: b.website,
          twitter: b.twitter,
          extraInfo: '',
          avatar: b.image
        })
      })

      // Save list of locales to Redis
      await GR.redis.set('sponsors:BACKER', JSON.stringify(_.orderBy(backers, ['amount', 'name'], ['desc', 'asc'])))

      return GR.logger.debug('Sponsors fetched: [ OK ]')
    } catch (err) {
      GR.logger.error(err.message)
      return false
    }
  }
}
