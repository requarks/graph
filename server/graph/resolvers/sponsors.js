/* global GR */

module.exports = {
  Query: {
    sponsors (obj, args, context, info) {
      return {}
    }
  },
  SponsorQuery: {
    async list (obj, args, context, info) {
      return GR.models.sponsors.getSponsors(args.kind)
    },
    async githubStars (obj, args, context) {
      return GR.models.sponsors.getGithubStars()
    }
  }
}
