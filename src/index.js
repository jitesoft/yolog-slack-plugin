import { Plugin } from '@jitesoft/yolog';
import { request } from 'undici';
import sprintf from '@jitesoft/sprintf';
import { stat } from '@babel/core/lib/gensync-utils/fs';

export default class Slack extends Plugin {
  #webHookUri = null;
  #channel = null;
  #timeFormat = (ts) => new Date(ts).toISOString();
  #notificationText = 'A log message with the tag \'%s\' was logged!';
  #username;
  #showCallStack = [
    'error',
    'critical',
    'alert',
    'emergency'
  ];
  #throwOnHttpError = false;

  /**
   * Change the default notification text.
   * Default value is: 'A log message with the tag \'%s\', was logged!.'.
   * Parameters used are the following: 1: %s - tag, 2: %s - timestamp formatted with timeFormat callback.
   *
   * @param {String} value Value to set.
   */
  // eslint-disable-next-line accessor-pairs
  set notificationText (value) {
    this.#notificationText = value;
  }

  /**
   * Change the output format of the time value.
   * Accepts a callback which will be passed a timestamp and expects a returned value to output.
   * The returned value have to be able to be converted to a string.
   *
   * Defaults to (ts) => new Date(ts).toISOString()
   *
   * @param {Function} callback Callback function to use instead of default.
   */
  // eslint-disable-next-line accessor-pairs
  set timeFormat (callback) {
    this.#timeFormat = callback;
  }

  /**
   * Constructor for the Slack Yolog plugin.
   *
   * @param {String}      webHookUri URI to send webhook payload to.
   * @param {String|null} [channel] Optional channel or user -name, if not set, default channel is used.
   * @param {String}      [username] Optional username to send with the webhook.
   * @param {boolean}     [throwOnHttpError] If to throw on http errors.
   */
  constructor (webHookUri, channel = null, username = 'Yolog', throwOnHttpError = false) {
    super();
    this.#webHookUri = webHookUri;
    this.#channel = channel;
    this.#username = username;
    this.#throwOnHttpError = throwOnHttpError;
  }

  /**
   * Method called when a log message is intercepted and the plugin is listening to the given tag.
   *
   * @param {String} tag Tag which was used when logging the message.
   * @param {Number} timestamp Timestamp (in ms) when the log was intercepted by the Yolog instance.
   * @param {String} message
   * @param {Error} error
   * @return Promise<void>
   * @abstract
   */
  async log (tag, timestamp, message, error) {
    const payload = {
      channel: this.#channel,
      username: this.#username,
      text: sprintf(this.#notificationText, tag, this.#timeFormat(timestamp)),
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `_*${tag.toUpperCase()}!*_\n_<!date^${Math.round(timestamp / 1000)}^{date_num} {time_secs}|${this.#timeFormat(timestamp)}>_`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: message
          }
        }
      ]
    };

    if (error && this.#showCallStack.indexOf(tag.toLowerCase()) !== -1) {
      payload.blocks.push(
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '_*CallStack:*_'
            },
            {
              type: 'mrkdwn',
              text: sprintf('```%s```', error.stack)
            }
          ]
        }
      );
    }

    const { statusCode } = await request(this.#webHookUri, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (this.#throwOnHttpError && statusCode > 399) {
      throw new Error(`Http Request responded with status code ${statusCode}`);
    }
  }
}
