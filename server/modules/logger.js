const fs = require('fs-extra')
const bunyan = require('bunyan')
const path = require('path')

module.exports = (opts) => {
  const logsPath = (global.PROD) ? '/logs' : path.join(process.cwd(), 'logs')

  if (!global.PROD) {
    fs.ensureDirSync(logsPath)
  }

  // Create Logger
  return bunyan.createLogger({
    name: 'requarks-graph',
    streams: [
      {
        stream: process.stdout,
        level: 'debug'
      },
      {
        path: path.join(logsPath, 'error.log'),
        level: 'warn'
      }
    ]
  })
}
