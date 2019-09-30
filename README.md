# Yolog Slack plugin


[![npm (scoped)](https://img.shields.io/npm/v/@jitesoft/yolog-slack-plugin)](https://www.npmjs.com/package/@jitesoft/yolog-slack-plugin)
[![Known Vulnerabilities](https://dev.snyk.io/test/npm/@jitesoft/yolog-slack-plugin/badge.svg)](https://dev.snyk.io/test/npm/@jitesoft/yolog-slack-plugin)
[![pipeline status](https://gitlab.com/jitesoft/open-source/javascript/yolog-plugins/slack/badges/master/pipeline.svg)](https://gitlab.com/jitesoft/open-source/javascript/yolog-plugins/slack/commits/master)
[![coverage report](https://gitlab.com/jitesoft/open-source/javascript/yolog-plugins/slack/badges/master/coverage.svg)](https://gitlab.com/jitesoft/open-source/javascript/yolog-plugins/slack/commits/master)
[![npm](https://img.shields.io/npm/dt/@jitesoft/yolog-slack-plugin)](https://www.npmjs.com/package/@jitesoft/yolog-slack-plugin)
[![Back project](https://img.shields.io/badge/Open%20Collective-Tip%20the%20devs!-blue.svg)](https://opencollective.com/jitesoft-open-source)


Plugin for the [`@jitesoft/yolog`](https://www.npmjs.com/package/@jitesoft/yolog) logger to post logs to Slack.

This plugin makes use of the slack WebHooks, hence it is only supported on the server side and not browser.

## Usage:

Install with your favorite package manager!

```bash
npm i @jitesoft/yolog-slack-plugin --save
yarn add @jitesoft/yolog-slack-plugin
```

Import and use just as with any other yolog plugin!

```js
import logger from '@jitesoft/yolog';
import SlackPlugin from '@jitesoft/yolog-slack-plugin';
logger.addPlugin(new SlackPlugin('https://webhook/uri'));
```

The constructor of the slack plugin takes a slack webhook uri, (please check the slack documentation on how to aquire
one of those) and an optional channel with the `#` prefix (or user with the `@` prefix). If the channel argument is not 
set, it will use the default channel set up with the webhook.

You can change the timestamp function (which defaults to javascripts default iso function) to your own callback by
setting the `timeFormat` property. The function should take a `timestamp` (that is, a normal unix timestamp) and return
a single value that can resolve to a string.

You may also change the informal text (aka pretext) of the output message by setting the `informalText` property. Check
the jsDocs for usage and placeholders which will be resolved.
