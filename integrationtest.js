const Yolog = require('@jitesoft/yolog').Yolog;
const Slack = require('./dist/index').default;

const logger = new Yolog([
  new Slack(process.env.SLACK_WEBHOOK_URL)
]);

Promise.resolve()
  .then(() => logger.info('test'))
  .then(() => logger.error('error!', new Error()))
  .then(() => logger.info('something %d %s', Date.now(), new Date().toISOString()));
