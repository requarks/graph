const mailchimpSvc = require('../services/mailchimp')
const _ = require('lodash')

module.exports = {
  /**
   * Subscribe to newsletter list
   */
  async subscribe (args) {
    try {
      await mailchimpSvc.subscribe(args)
    } catch (err) {
      switch (_.get(err, 'error.title', 'Unknown')) {
        case 'Member Exists':
          throw new Error('This email address is already subscribed!')
        default:
          throw new Error(_.get(err, 'error.detail', 'An unexpected error occured.'))
      }
    }
  }
}
