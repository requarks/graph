/* global GR */

module.exports = {
  Query: {
    localization (obj, args, context, info) {
      return {}
    }
  },
  LocalizationQuery: {
    async locales (obj, args, context, info) {
      return GR.models.localization.getLocales()
    },
    async strings (obj, args, context, info) {
      return GR.models.localization.getLocaleStrings(args.code)
    }
  }
}
