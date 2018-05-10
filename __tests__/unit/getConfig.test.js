const getConfig = require('../../index')

describe('probotReportError', () => {
  describe('valid', () => {
    it('returns config from context on valid data', async () => {
      const context = {config: jest.fn()}
      const expected = {a: 1, b: 2, c: 3}
      const path = 'baz'
      const defaultConfig = {a: 7}

      context.config.mockReturnValueOnce(expected)

      expect(await getConfig(context, path, defaultConfig)).toBe(expected)

      expect(context.config.mock.calls.length).toBe(1)

      const mc = context.config.mock.calls[0]
      expect(mc[0]).toBe(path)
      expect(mc[1]).toBe(defaultConfig)
    })
  })

  describe('invalid', () => {
    let context = {}
    const expected = new Error('Should throw this error')
    const path = 'baz'
    const defaultConfig = {a: 7}
    const title = 'foo'
    const body = 'bar'

    beforeEach(() => {
      context = {
        config: jest.fn(),
        github: {issues: {create: jest.fn(), edit: jest.fn()}, search: {issues: jest.fn()}},
        issue: jest.fn(),
        payload: {repository: {full_name: 'foo/bar'}}
      }

      context.config.mockImplementation(() => {throw expected})
      context.issue.mockImplementation(params => params)
      context.github.search.issues.mockReturnValueOnce({data: {items: [{title: 'foobar'}, {title: 'barbaz'}]}})
    })

    it('creates a new issue with the given title and body', async () => {
      let actual = null
      try {
        await getConfig(context, path, defaultConfig, title, body)
      } catch (err) {
        actual = err
      }
      expect(actual).toBe(expected)

      const fullBody = `${body}

\`\`\`
Error: Should throw this error
\`\`\`

Check the syntax of \`${path}\` and make sure it's valid.`

      expect(context.issue.mock.calls.length).toBe(1)
      expect(context.issue.mock.calls[0][0]).toEqual({title, body: fullBody})

      expect(context.github.issues.create.mock.calls.length).toBe(1)
      expect(context.github.issues.create.mock.calls[0][0]).toEqual({title, body: fullBody})
    })

    it('creates a new issue with a default title and body', async () => {
      let actual = null
      try {
        await getConfig(context, path, defaultConfig)
      } catch (err) {
        actual = err
      }
      expect(actual).toBe(expected)

      const defaultTitle = 'Error while running this App'
      const defaultBody = `An error occurred while running your app.

\`\`\`
${expected.toString()}
\`\`\`

Check the syntax of \`${path}\` and make sure it's valid.`

      expect(context.issue.mock.calls.length).toBe(1)
      expect(context.issue.mock.calls[0][0]).toEqual({title: defaultTitle, body: defaultBody})

      expect(context.github.issues.create.mock.calls.length).toBe(1)
      expect(context.github.issues.create.mock.calls[0][0]).toEqual({
        title: defaultTitle,
        body: defaultBody
      })
    })

    it('creates an issue with the initialized values', async () => {
      const getConfigDefaults = require('../../index').defaults({defaultConfig, title, body, path})

      let actual = null
      try {
        await getConfigDefaults(context)
      } catch (err) {
        actual = err
      }
      expect(actual).toBe(expected)

      const fullBody = `${body}

\`\`\`
Error: Should throw this error
\`\`\`

Check the syntax of \`${path}\` and make sure it's valid.`

      expect(context.issue.mock.calls.length).toBe(1)
      expect(context.issue.mock.calls[0][0]).toEqual({title, body: fullBody})

      expect(context.github.issues.create.mock.calls.length).toBe(1)
      expect(context.github.issues.create.mock.calls[0][0]).toEqual({title, body: fullBody})
    })

    it('ignores error for existing issues', async () => {
      let actual = null
      try {
        await getConfig(context, path, defaultConfig, 'foobar', body)
      } catch (err) {
        actual = err
      }
      expect(actual).toBe(expected)


      expect(context.github.search.issues.mock.calls.length).toBe(1)
      expect(context.github.search.issues.mock.calls[0][0]).toEqual({q: `repo:foo/bar in:title type:issue foobar`})

      expect(context.issue.mock.calls.length).toBe(0)
      expect(context.github.issues.create.mock.calls.length).toBe(0)
    })

    it('reopens an old issue', async () => {
      context.github.search.issues.mockReset()
      context.github.search.issues.mockReturnValueOnce({data: {items: [{title: 'foobar', state: 'closed', number: 55}]}})

      let actual = null
      try {
        await getConfig(context, path, defaultConfig, 'foobar', body)
      } catch (err) {
        actual = err
      }
      expect(actual).toBe(expected)

      expect(context.github.search.issues.mock.calls.length).toBe(1)
      expect(context.github.search.issues.mock.calls[0][0]).toEqual({q: `repo:foo/bar in:title type:issue foobar`})

      expect(context.issue.mock.calls.length).toBe(1)
      expect(context.issue.mock.calls[0][0]).toEqual({number: 55, state: 'open'})

      expect(context.github.issues.edit.mock.calls.length).toBe(1)
      expect(context.github.issues.edit.mock.calls[0][0]).toEqual({number: 55, state: 'open'})
    })
  })
})
