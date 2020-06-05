/* global GR */

const svcLokalise = require('../services/lokalise')
const countryLanguage = require('country-language')
const _ = require('lodash')

module.exports = {
  /**
   * Get all locales
   */
  async getLocales () {
    const locales = await GR.redis.get('locales')
    return JSON.parse(locales)
  },
  /**
   * Get locale data
   */
  async getLocaleStrings (id) {
    const strings = await GR.redis.get(`locale:${id}`)
    return strings ? JSON.parse(strings) : []
  },
  /**
   * Refresh all country data from remote source
   */
  async refreshLocales () {
    GR.logger.debug('Refreshing all locales...')

    try {
      // Fetch all locales
      const langsResp = await svcLokalise.getLanguages()
      const langs = []

      for (const lng of langsResp) {
        let lngIsoSimple = lng.lang_iso

        if (lng.lang_iso.indexOf('_') > 0) {
          lng.lang_iso = lng.lang_iso.replace('_', '-').toLowerCase()
          lngIsoSimple = lng.lang_iso.split('-')[0]
        }

        if (!countryLanguage.languageCodeExists(lngIsoSimple)) {
          continue
        }

        const lngInfo = countryLanguage.getLanguage(lngIsoSimple)
        lngInfo.name = [lng.lang_name]

        const strings = await svcLokalise.getStrings(lng.lang_id)

        let oldestCreatedAt = '9'
        let latestModifiedAt = '0'
        let processed = 0
        let skipped = 0

        // Save locale language strings
        await GR.redis.set(`locale:${lng.lang_iso}`, JSON.stringify(_.map(strings, str => {
          if (str.created_at < oldestCreatedAt) {
            oldestCreatedAt = str.created_at
          }
          if (_.get(str, 'translations[0].modified_at', '0') > latestModifiedAt) {
            latestModifiedAt = _.get(str, 'translations[0].modified_at', '0')
          }
          const strValue = _.get(str, 'translations[0].translation', '')
          if (strValue === '') {
            skipped++
          } else {
            processed++
          }
          return {
            key: str.key_name.web,
            value: strValue
          }
        })))

        langs.push({
          code: lng.lang_iso,
          name: lngInfo.name[0],
          nativeName: lngInfo.nativeName[0],
          isRTL: (lng.is_rtl),
          createdAt: new Date(oldestCreatedAt),
          updatedAt: new Date(latestModifiedAt),
          availability: Math.round(processed / (processed + skipped) * 100)
        })
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
