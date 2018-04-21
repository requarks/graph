/* global GR */

const svcLocation = require('../services/location')
const _ = require('lodash')

module.exports = {
  /**
   * Get all countries data
   */
  async getAll () {
    let countries = await GR.redis.get(`countries`)
    return _.reject(JSON.parse(countries), c => !c.allowed)
  },
  /**
   * Get all country codes
   */
  async getAllCodes () {
    return _.map(await this.getAll(), 'code')
  },
  /**
   * Get country data by country code
   */
  async getByCode (id) {
    let country = await GR.redis.get(`country:${id}`)
    return country ? JSON.parse(country) : {}
  },
  /**
   * Refresh all country data from remote source
   */
  async refreshCountries () {
    GR.logger.debug('Refreshing all countries...')

    try {
      // Fetch all countries
      let countries = await svcLocation.getCountries()

      // Save countries to Redis
      await GR.redis.mset(_.transform(countries, (result, country, key) => {
        if (country.alpha2Code.length === 2) {
          result[`country:${country.alpha2Code}`] = JSON.stringify(country)
        }
      }, {}))

      return GR.logger.debug('Countries info fetched: [ OK ]')
    } catch (err) {
      GR.logger.error(err.message)
      return false
    }
  }
}
