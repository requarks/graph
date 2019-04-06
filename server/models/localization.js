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
        let lngInfo
        switch (lng.lang_iso) {
          case 'zh':
            lngInfo = countryLanguage.getLanguage('zh')
            lngInfo.name = [lng.lang_name]
            break
          case 'zh_TW':
            lng.lang_iso = 'zh-tw'
            lngInfo = countryLanguage.getLanguage('zh')
            lngInfo.name = [lng.lang_name]
            break
          default:
            if (!countryLanguage.languageCodeExists(lng.lang_iso)) {
              continue
            }
            lngInfo = countryLanguage.getLanguage(lng.lang_iso)
            break
        }
        let strings = await svcLokalise.getStrings(lng.lang_id)

        let oldestCreatedAt = '9'
        let latestModifiedAt = '0'

        // Save locale language strings
        await GR.redis.set(`locale:${lng.lang_iso}`, JSON.stringify(_.map(strings, str => {
          if (str.created_at < oldestCreatedAt) {
            oldestCreatedAt = str.created_at
          }
          if (_.get(str, 'translations[0].modified_at', '0') > latestModifiedAt) {
            latestModifiedAt = _.get(str, 'translations[0].modified_at', '0')
          }
          return {
            key: str.key_name.web,
            value: _.get(str, 'translations[0].translation', '???')
          }
        })))

        langs.push({
          code: lng.lang_iso,
          name: lngInfo.name[0],
          nativeName: lngInfo.nativeName[0],
          isRTL: (lng.is_rtl),
          createdAt: new Date(oldestCreatedAt),
          updatedAt: new Date(latestModifiedAt)
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
