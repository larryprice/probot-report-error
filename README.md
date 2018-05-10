probot-report-error
===================

This module allows you to add error reporting when your [probot](http://probot.github.io/)-based GitHub applications fail to load a configuration file.

Whenever a configuration file is loaded containing invalid YAML, this module will automatically create an issue on your repository explaining the error.

### Usage ###

This package is installable within your application via npm:

```
$ npm install larryprice/probot-report-error
```

Use `probot-report-error` whenever loading a config from your context object. A basic example may look like this:

``` javascript
const getConfig = require('./errors')

module.exports = (robot) => {
  robot.on('issues.closed', async context => {
    // Use getConfig instead of calling context.config directly
    const config = await getConfig(context, 'config.yml', {}, 'Your Fancy Title', 'Your Informative Issue Body')

    // ...
  })
}
```

The `getConfig` function takes in 5 arguments:

``` javascript
getConfig(context: probot.Context, fileName: String, defaultOptions: Object, title: String, body: String)
```

* Required arguments:
  * `context` is the `probot.Context` object received from a webhook.
  * `fileName` is the path to your configuration file within the `.github` directory of your repository
* Required arguments:
  * `defaultOptions` is a dictionary of default options to use if there is no configuration object
  * `title` is the title used when creating an issue in your repository
  * `body` is the first part of the body used when creating an issue in your repository. The rest of the body will contain the formatted error.
