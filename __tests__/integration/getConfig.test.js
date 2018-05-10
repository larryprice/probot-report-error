const Context = require('probot/lib/context')
const EnhancedGitHubClient = require('probot/lib/github')
const nock = require('nock')
const getConfig = require('../../index')

describe('probotReportError', () => {
  let context
  let github
  beforeEach(() => {
    event = {
      event: 'push',
      payload: {
        repository: {
          owner: {login: 'larryprice'},
          name: 'probot',
          full_name: 'larryprice/probot'
        },
        issue: {number: 418}
      }
    }
    context = new Context(event, new EnhancedGitHubClient({limiter: 0, logger: {debug: () => {}}}))
    github = nock('https://api.github.com')
      .defaultReplyHeaders({'Content-Type': 'application/json'})
  })

  afterEach(() => {
    github.isDone()
    nock.cleanAll()
  })

  describe('valid', () => {
    it('returns the config', async () => {
      github = github.get('/repos/larryprice/probot/contents/.github/somePath').reply(200, {content: 'aGVsbG86IHdvcmxkDQpnb29kYnllOiBtb25kYXk='})
      const config = await getConfig(context, 'somePath', {}, 'Some Title', 'Some Body')
      expect(config).toEqual({hello: 'world', goodbye: 'monday'})
    })
  })

  describe('invalid', () => {
    it('creates a new issue', async () => {
      let error
      github = github.get('/repos/larryprice/probot/contents/.github/somePath').reply(400)
        .get('/search/issues?q=repo%3Alarryprice%2Fprobot%20in%3Atitle%20type%3Aissue%20Some%20Title').reply(200, {
          items: [{'title': 'Not a match'}]})
        .post('/repos/larryprice/probot/issues', "{\"number\":418,\"title\":\"Some Title\",\"body\":\"Some Body\\n\\n```\\n\\n```\\n\\nCheck the syntax of `somePath` and make sure it's valid.\"}").reply(200, {number: 55})
      try {
        await getConfig(context, 'somePath', {}, 'Some Title', 'Some Body')
      } catch (err) {
        error = err
      }
      expect(error).not.toBeNull()
      if (error.code !== 400) {
        console.error(error)
      }
      expect(error.code).toBe(400)
    })

    it('does not create existing, open issues', async () => {
      let error
      github = github.get('/repos/larryprice/probot/contents/.github/somePath').reply(400)
        .get('/search/issues?q=repo%3Alarryprice%2Fprobot%20in%3Atitle%20type%3Aissue%20Some%20Title').reply(200, {
          items: [{'title': 'Some Title', 'state': 'open'}]})
      try {
        await getConfig(context, 'somePath', {}, 'Some Title', 'Some Body')
      } catch (err) {
        error = err
      }
      expect(error).not.toBeNull()
      if (error.code !== 400) {
        console.error(error)
      }
      expect(error.code).toBe(400)
    })

    it('does not create existing, open issues', async () => {
      let error
      github = github.get('/repos/larryprice/probot/contents/.github/somePath').reply(400)
        .get('/search/issues?q=repo%3Alarryprice%2Fprobot%20in%3Atitle%20type%3Aissue%20Some%20Title').reply(200, {
          items: [{'title': 'Some Title', 'state': 'closed', 'number': 55}]})
        .patch('/repos/larryprice/probot/issues/55', "{\"state\":\"open\"}").reply(200, {number: 55})
      try {
        await getConfig(context, 'somePath', {}, 'Some Title', 'Some Body')
      } catch (err) {
        error = err
      }
      expect(error).not.toBeNull()
      if (error.code !== 400) {
        console.error(error)
      }
      expect(error.code).toBe(400)
    })
  })
})
