/* global GR */

const _ = require('lodash')

module.exports = {
  /**
   * Get latest version for channel
   */
  async getLatest (channel) {
    return GR.redis.get(`release:${channel}`)
  },

  async getLatestMatch (channel, currentVersion) {
    return GR.db('releases').where('channel', channel).andWhere('minimumVersionRequired', '<=', currentVersion).orderBy('version', 'desc').first()
  },
  /**
   * Refresh versions from DB
   */
  async refreshLatestReleases () {
    GR.logger.debug('Fetching latest release versions...')

    try {
      // Fetch all countries
      const data = await GR.db.raw('SELECT DISTINCT ON ("channel") * FROM "releases" ORDER BY "channel", "version" DESC')
      const releases = _.get(data, 'rows', [])
      if (releases.length > 0) {
        for (const rel of releases) {
          await GR.redis.set(`release:${rel.channel}`, rel.version)
        }
      }

      return GR.logger.debug('Latest release versions fetched: [ OK ]')
    } catch (err) {
      GR.logger.error(err.message)
      return false
    }
  }
}
