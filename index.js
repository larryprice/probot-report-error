const getConfig = function(context, path, title, body) {
  const _path = path || this.path
  const _title = title || this.title
  const _body = body || this.body

  return null
}

const probotReportError = ({path, title, body}) => {
  return {getConfig: getConfig.bind({path, title, body})}
}

probotReportError.getConfig = getConfig

module.exports = probotReportError
