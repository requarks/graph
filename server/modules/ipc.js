const ipc = require('node-ipc')
const Promise = require('bluebird')

/* global GR */

module.exports = {
  instance: null,
  onReady: null,
  init (id) {
    ipc.config.silent = true

    switch (id) {
      case 'master':
        GR.logger.info('Starting IPC Server...')
        this.onReady = new Promise((resolve, reject) => {
          ipc.config.id = 'graph'
          ipc.serve(() => {
            ipc.server.on('addResourceEntry', (data, socket) => {
              GR.lang.addResourceEntry(data)
            })
            ipc.server.on('addResourceBundle', (data, socket) => {
              GR.lang.addResourceBundle(data)
            })
            ipc.server.on('socket.disconnected', (socket, destroyedSocketID) => {
              GR.logger.warn(`IPC: Client ${destroyedSocketID} has disconnected.`)
            })
            ipc.server.on('start', () => {
              GR.logger.info('IPC Server: [ OK ]')
              resolve()
            })
          })

          ipc.server.start()
        })
        break
      case 'worker-scheduled-apis':
        GR.logger.info('Worker {scheduled-apis} connecting to IPC Server...')
        this.onReady = new Promise((resolve, reject) => {
          ipc.config.id = 'workerScheduledApis'
          ipc.connectTo('graph', resolve)
        })
        this.onReady.then(() => GR.logger.info('Worker {scheduled-apis} connected to IPC Server: [ OK ]'))
        break
    }
    this.instance = ipc

    return this
  },
  emit (event, data) {
    return this.onReady.then(() => {
      return this.instance.of.graph.emit(event, data)
    })
  }
}
