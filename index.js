const getConfig = function(context, path, defaultConfig, title, body) {
  const _path = path || this.path
  const _defaultConfig = defaultConfig || this.defaultConfig
  const _title = title || this.title
  const _body = body || this.body

  return null
}

const probotReportError = ({path, defaultConfig, title, body}) => {
  return {getConfig: getConfig.bind({path, defaultConfig, title, body})}
}

probotReportError.getConfig = getConfig

module.exports = probotReportError
