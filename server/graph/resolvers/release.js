const moment = require('moment')

module.exports = {
  Query: {
    releases (obj, args, context, info) {
      return {}
    }
  },
  ReleaseQuery: {
    async checkForUpdates (obj, args, context, info) {
      // TODO
      return {
        channel: 'BETA',
        version: '2.0.0-beta.91',
        releaseDate: moment.utc('2019-04-07T08:00:00.000Z'),
        minimumVersionRequired: '2.0.0-beta.0',
        minimumNodeRequired: '10.12.0'
      }
    }
  }
}