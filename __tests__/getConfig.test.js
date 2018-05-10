const getConfig = require('../index')

describe('probotReportError', () => {
  describe('getConfig', () => {
    it('returns config from context on valid data', () => {
      expect(false).toBe(true)
    })

    it('throws error on invalid context', () => {
      expect(false).toBe(true)
    })

    it('creates a new issue with the default title and body', () => {
      expect(false).toBe(true)
    })

    it('creates a new issue with the given title and body', () => {
      expect(false).toBe(true)
    })

    it('creates an issue with the initialized values', () => {
      const path = 'some-path'
      const defaultConfig = {a: 1, b: 2, c: 3}
      const title = 'Some Title'
      const body = 'Some Body'
      const getConfigDefaults = require('../index')({defaultConfig, title, body, path})

      expect(false).toBe(true)
    })

    it('posts a comment on an existing issue', () => {
      expect(false).toBe(true)
    })

    it('reopens an old issue', () => {
      expect(false).toBe(true)
    })
  })
})
