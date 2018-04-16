const CustomError = require('custom-error-instance')

/**
 * Code Categories:
 *
 * 10xx Common
 * 20xx Localization
 */

module.exports = {
  UnexpectedError: CustomError('UnexpectedError', {
    message: 'Unexpected Error',
    code: 1001
  })
}
