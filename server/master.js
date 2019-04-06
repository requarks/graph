const { ApolloServer } = require('apollo-server-express')
const autoload = require('auto-load')
const bodyParser = require('body-parser')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express')
const http = require('http')
const path = require('path')

/* global GR */

module.exports = async () => {
  // ----------------------------------------
  // Load global modules
  // ----------------------------------------

  GR.package = require('../package.json')
  GR.redis = require('./modules/redis')()

  GR.logger.info(`Loading Models...`)
  GR.models = autoload(path.join(GR.conf.base, '/models'))
  GR.logger.info(`Models: [ OK ]`)

  // ----------------------------------------
  // Load Local Modules
  // ----------------------------------------

  const mw = autoload(path.join(GR.conf.base, '/middlewares'))

  // ----------------------------------------
  // Express Server
  // ----------------------------------------

  const app = express()

  app.use(compression())
  app.use(mw.security.general)
  app.use(cors(GR.conf.cors))
  app.options('*', cors(GR.conf.cors))
  app.enable('trust proxy')

  // View Engine

  app.set('views', path.join(GR.conf.base, 'views'))
  app.set('view engine', 'pug')
  app.set('view cache', !GR.conf.dev)

  // Body Parser

  app.use(bodyParser.json({ limit: '1mb' }))
  app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }))

  // Cookie Parser

  app.use(cookieParser())

  // ----------------------------------------
  // Set view accessible vars
  // ----------------------------------------

  app.locals.packageVersion = GR.package.version
  app.locals.isDev = GR.conf.dev

  // ----------------------------------------
  // Apollo Server (GraphQL)
  // ----------------------------------------

  const graphqlSchema = require('./graph')
  const apolloServer = new ApolloServer({
    ...graphqlSchema,
    context: ({ req, res }) => ({ req, res })
  })
  apolloServer.applyMiddleware({ app, path: '/', cors: GR.conf.cors })

  // ----------------------------------------
  // Error handling
  // ----------------------------------------

  app.use((req, res, next) => {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: GR.conf.debug ? err : {}
    })
  })

  // ----------------------------------------
  // Start HTTP server
  // ----------------------------------------

  GR.logger.info('Starting HTTP server on port ' + GR.conf.port + '...')
  app.set('port', GR.conf.port)
  const server = http.createServer(app)
  server.listen(GR.conf.port, '0.0.0.0')
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error
    }
    switch (error.code) {
      case 'EACCES':
        GR.logger.error('Listening on port ' + GR.conf.port + ' requires elevated privileges!')
        return process.exit(1)
      case 'EADDRINUSE':
        GR.logger.error('Port ' + GR.conf.port + ' is already in use!')
        return process.exit(1)
      default:
        throw error
    }
  })
}
