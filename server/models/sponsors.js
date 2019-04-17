/* global GR */

const svcPatreon = require('../services/patreon')
const svcOpenCollective = require('../services/open-collective')
const svcLokalise = require('../services/lokalise')
const svcGitHub = require('../services/github')
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

  async getGithubStars () {
    return GR.redis.get(`stars`)
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

      // Save list of backers to Redis
      await GR.redis.set('sponsors:BACKER', JSON.stringify(_.orderBy(backers, ['amount', 'name'], ['desc', 'asc'])))

      // Fetch from Lokalise
      const translatorsData = await svcLokalise.getContributors()
      const translators = translatorsData.map(tr => {
        let lngs = tr.languages.map(l => l.lang_name).filter(l => l !== 'English')
        if (lngs.length > 5) { // Is the admin...
          lngs = ['English', 'French']
        }

        return {
          kind: 'TRANSLATOR',
          id: `lokalise-${tr.user_id}`,
          source: 'Lokalise',
          joined: moment(_.get(tr, 'created_at', false), 'YYYY-MM-DD HH:mm:ss').toISOString(),
          name: tr.fullname,
          website: null,
          twitter: null,
          extraInfo: lngs.join(', '),
          avatar: null
        }
      })

      // Save list of translators to Redis
      await GR.redis.set('sponsors:TRANSLATOR', JSON.stringify(_.orderBy(translators, ['joined', 'name'], ['asc', 'asc'])))

      // Fetch from GitHub
      const devsData = await svcGitHub.getContributors()
      const devs = devsData.map(dev => {
        return {
          kind: 'DEVELOPER',
          id: `github-${dev.id}`,
          source: 'GitHub',
          joined: moment().toISOString(),
          name: dev.login,
          website: dev.html_url,
          twitter: null,
          extraInfo: dev.contributions,
          avatar: dev.avatar_url
        }
      })

      // Save list of developers to Redis
      await GR.redis.set('sponsors:DEVELOPER', JSON.stringify(_.orderBy(devs, ['extraInfo', 'name'], ['desc', 'asc'])))

      // GitHub Stars
      const ghStars = await svcGitHub.getStars()
      await GR.redis.set('stars', Math.floor(ghStars / 100) * 100)

      return GR.logger.debug('Sponsors fetched: [ OK ]')
    } catch (err) {
      GR.logger.error(err.message)
      return false
    }
  }
}
