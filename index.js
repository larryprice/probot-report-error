const defaultBody = (err, path) => {
  return `An error occurred while running your App:

\`\`\`
${err.toString()}
\`\`\`

Check the syntax of \`${path}\` and make sure it's valid.`
}
const defaultTitle = 'Error while running this App'

const getConfig = async function(context, path, defaultConfig, title, body) {
  const _path = path || this.path
  const _defaultConfig = defaultConfig || this.defaultConfig

  try {
    return await context.config(_path, _defaultConfig)
  } catch (err) {
    const _title = title || this.title || defaultTitle
    const _body = body || this.body || defaultBody(err, path)

    const issues = await context.github.search.issues({q: `repo:${context.payload.repository.full_name} in:title type:issue ${_title}`})
    if (!issues.data.items.some(issue => issue.title === _title)) {
      await context.github.issues.create(context.issue({title: _title, body: _body}))
    }

    throw err
  }
}

getConfig.defaults = ({path, defaultConfig, title, body}) => {
  return getConfig.bind({path, defaultConfig, title, body})
}

module.exports = getConfig
