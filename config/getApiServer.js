module.exports = function getApiServer() {
  const {
    npm_config_server,
    npm_config_port
  } = process.env
  if (npm_config_server) {
    if (npm_config_server.startsWith('http')) {
      return npm_config_server
    } else {
      return `http://${npm_config_server}`
    }
  } else if (npm_config_port) {
    return `http://localhost:${npm_config_port}`
  }
}
