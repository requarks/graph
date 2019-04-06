/* global GR */

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const autoload = require('auto-load')
const { createRateLimitTypeDef } = require('graphql-rate-limit-directive')

GR.logger.info(`Loading GraphQL Schema...`)

// Schemas

let typeDefs = [createRateLimitTypeDef()]
let schemas = fs.readdirSync(path.join(GR.SERVERPATH, 'graph/schemas'))
schemas.forEach(schema => {
  typeDefs.push(fs.readFileSync(path.join(GR.SERVERPATH, `graph/schemas/${schema}`), 'utf8'))
})

// Resolvers

let resolvers = {}
const resolversObj = _.values(autoload(path.join(GR.SERVERPATH, 'graph/resolvers')))
resolversObj.forEach(resolver => {
  _.merge(resolvers, resolver)
})

// Directives

let schemaDirectives = {
  ...autoload(path.join(GR.SERVERPATH, 'graph/directives'))
}

GR.logger.info(`GraphQL Schema: [ OK ]`)

module.exports = {
  typeDefs,
  resolvers,
  schemaDirectives
}
