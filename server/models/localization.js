/* global GR */

const svcLokalise = require('../services/lokalise')
const countryLanguage = require('country-language')
const _ = require('lodash')

module.exports = {
  /**
   * Get all locales
   */
  async getLocales () {
    let locales = await GR.redis.get(`locales`)
    return JSON.parse(locales)
  },
  /**
   * Get locale data
   */
  async getLocaleStrings (id) {
    let strings = await GR.redis.get(`locale:${id}`)
    return strings ? JSON.parse(strings) : []
  },
  /**
   * Refresh all country data from remote source
   */
  async refreshLocales () {
    GR.logger.debug('Refreshing all locales...')

    try {
      // Fetch all locales
      let langsResp = await svcLokalise.getLanguages()
      let langs = []

      for (let lng of langsResp) {
        let strings = await svcLokalise.getStrings(lng.iso)
        const lngInfo = countryLanguage.getLanguage(lng.iso)
        langs.push({
          code: lng.iso,
          name: lngInfo.name[0],
          nativeName: lngInfo.nativeName[0],
          isRTL: (lng.rtl === '1'),
          createdAt: _.chain(strings).sortBy('created_at').head().get('created_at', '').value(),
          updatedAt: _.chain(strings).sortBy('modified_at').last().get('modified_at', '').value()
        })

        // Save locale language strings
        await GR.redis.set(`locale:${lng.iso}`, JSON.stringify(_.map(strings, str => ({
          key: str.key,
          value: str.translation
        }))))
      }

      // Save list of locales to Redis
      await GR.redis.set('locales', JSON.stringify(langs))

      return GR.logger.debug('Locales data fetched: [ OK ]')
    } catch (err) {
      GR.logger.error(err.message)
      return false
    }
  }
}
