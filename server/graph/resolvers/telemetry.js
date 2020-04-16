const graphHelper = require('../../helpers/graph')

/* global GR */

module.exports = {
  Mutation: {
    telemetry (obj, args, context, info) {
      return {}
    }
  },
  TelemetryMutation: {
    async instance (obj, args, context, info) {
      try {
        await GR.models.telemetry.registerInstance(args)
        return {
          responseResult: graphHelper.generateSuccess('Instance telemetry registered successfully.')
        }
      } catch (err) {
        return graphHelper.generateError(err)
      }
    }
  }
}
