const graphHelper = require('../../helpers/graph')

/* global GR */

module.exports = {
  Mutation: {
    newsletter (obj, args, context, info) {
      return {}
    }
  },
  NewsletterMutation: {
    async subscribe (obj, args, context, info) {
      try {
        await GR.models.newsletter.subscribe(args)
        return {
          responseResult: graphHelper.generateSuccess('Subscribed successfully.')
        }
      } catch (err) {
        return graphHelper.generateError(err)
      }
    }
  }
}
