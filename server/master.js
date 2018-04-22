const path = require('path')
const autoload = require('auto-load')
const bodyParser = require('body-parser')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express')
const graphqlApollo = require('apollo-server-express')
const { ApolloEngine } = require('apollo-engine')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')

/* global GR */

module.exports = async () => {
  // ----------------------------------------
  // Load global modules
  // ----------------------------------------

  GR.package = require('../package.json')
  GR.redis = require('./modules/redis')()
  // GR.lang = require('./modules/localization').init()
  GR.ipc = require('./modules/ipc').init('master')
  // GR.mongo = require('./mongoose').init()

  GR.logger.info(`Loading Models...`)
  GR.models = autoload(path.join(GR.conf.base, '/models'))
  GR.logger.info(`Models: [ OK ]`)

  // ----------------------------------------
  // Load Local Modules
  // ----------------------------------------

  const graphqlSchema = require('./graph')

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

  // Monitor Endpoint

  app.use('/monitor', (req, res, next) => {
    res.status(200).json({ ok: true })
  })

  // ----------------------------------------
  // Localization
  // ----------------------------------------

  // GR.lang.attachMiddleware(app)

  // ----------------------------------------
  // Set view accessible vars
  // ----------------------------------------

  app.locals.packageVersion = GR.package.version
  app.locals.isDev = GR.conf.dev

  // ----------------------------------------
  // Controllers
  // ----------------------------------------

  // GraphQL Endpoints

  app.post('/', (req, res, next) => {
    graphqlApollo.graphqlExpress({
      schema: graphqlSchema,
      context: { req, res },
      formatError: (err) => {
        return {
          message: err.message
        }
      },
      tracing: true,
      cacheControl: true
    })(req, res, next)
  })

  // GraphiQL

  app.get('/graphiql', graphqlApollo.graphiqlExpress({ endpointURL: '/' }))

  // Fallback Index

  app.get('/', (req, res, next) => {
    res.render('index')
  })

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

  const engine = new ApolloEngine({
    apiKey: GR.conf.apollo.engine,
    logging: {
      level: 'WARN'
    },
    origins: [{
      supportsBatch: true
    }]
  })

  GR.logger.info('Starting HTTP server on port ' + GR.conf.port + '...')
  engine.listen({
    port: GR.conf.port,
    expressApp: app,
    graphqlPaths: ['/']
  }, () => {
    GR.logger.info('HTTP server state: [ RUNNING ]')

    const wsServer = new SubscriptionServer({ // eslint-disable-line no-unused-vars
      execute,
      subscribe,
      schema: graphqlSchema
    }, {
      server: engine,
      path: '/subscriptions'
    })
  })
  engine.on('error', (error) => {
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
