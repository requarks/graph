const semver = require('semver')

/* global GR */

const uuidv4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

module.exports = {
  async registerInstance (args) {
    if (args.clientId.length !== 36 || !uuidv4Regex.test(args.clientId)) {
      throw new Error('Invalid Client Id')
    }

    if (!semver.valid(args.version)) {
      throw new Error('Invalid Version')
    }

    if (args.os.length < 5 || args.os.length > 255) {
      throw new Error('Invalid OS')
    }

    if (args.dbVersion.length < 1 || args.dbVersion.length > 255) {
      throw new Error('Invalid DB Version')
    }

    if (!semver.valid(args.nodeVersion)) {
      throw new Error('Invalid Node Version')
    }

    if (args.cpuCores < 1 || args.cpuCores > 1000) {
      throw new Error('Invalid CPU Cores Count')
    }

    if (args.ramMBytes < 0 || args.ramMBytes > 1000000000) {
      throw new Error('Invalid RAM Megabytes Amount')
    }

    return GR.db('telemetry').insert({
      clientId: args.clientId,
      version: semver.clean(args.version),
      platform: args.platform,
      os: args.os,
      architecture: args.architecture,
      dbType: args.dbType,
      dbVersion: args.dbVersion,
      nodeVersion: semver.clean(args.nodeVersion),
      cpuCores: args.cpuCores,
      ramMBytes: args.ramMBytes,
      event: args.event,
      timestamp: GR.db.fn.now()
    })
  }
}
