/* global GR */

module.exports = {
  Query: {
    releases (obj, args, context, info) {
      return {}
    }
  },
  ReleaseQuery: {
    async checkForUpdates (obj, args, context, info) {
      return GR.models.release.getLatestMatch(args.channel, args.version)
    },
    async latest (obj, args, context) {
      return ''
    }
  }
}
