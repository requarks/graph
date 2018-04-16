/* global GR */

const gqlTools = require('graphql-tools')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const autoload = require('auto-load')

GR.logger.info(`Loading GraphQL Schema...`)

// Schemas

let typeDefs = []
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

const Schema = gqlTools.makeExecutableSchema({
  typeDefs,
  resolvers
})

GR.logger.info(`GraphQL Schema: [ OK ]`)

module.exports = Schema
