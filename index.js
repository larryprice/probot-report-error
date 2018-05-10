const generateBody = (body, err, path) => {
  return `${body}

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

    const issuesReq = await context.github.search.issues({q: `repo:${context.payload.repository.full_name} in:title type:issue ${_title}`})
    const issue = issuesReq.data.items.find(issue => issue.title === _title)
    if (!issue) {
      const _body = generateBody(body || this.body || 'An error occurred while running your app.', err, _path)
      await context.github.issues.create(context.issue({title: _title, body: _body}))
    } else if (issue.state === 'closed') {
      await context.github.issues.edit(context.issue({number: issue.number, state: 'open'}))
    }

    throw err
  }
}

getConfig.defaults = ({path, defaultConfig, title, body}) => {
  return getConfig.bind({path, defaultConfig, title, body})
}

module.exports = getConfig
