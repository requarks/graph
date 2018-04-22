/* global GR */

module.exports = {
  Query: {
    location (obj, args, context, info) {
      return {}
    }
  },
  LocationQuery: {
    async country (obj, args, context, info) {
      return GR.models.location.getCountryByCode(args.code)
    },
    async countries (obj, args, context, info) {
      return GR.models.location.getCountries()
    }
  }
}
