import { Plugin } from '@jitesoft/yolog';
import fetch from 'node-fetch';
import sprintf from '@jitesoft/sprintf';

export default class Slack extends Plugin {
  #webHookUri = null;
  #channel = null;
  #colors = {
    error: 'danger',
    critical: 'danger',
    alert: 'danger',
    emergency: 'danger',
    warning: 'warning',
    debug: 'good',
    info: '#CCCC00'
  };
  #timeFormat = (ts) => new Date(ts).toISOString();
  #informalText = 'A log message with the tag %s, was logged at %s.';

  /**
   * Change the output format of the time value.
   * Accepts a callback which will be passed a timestamp and expects a returned value to output.
   * The returned value have to be able to be converted to a string.
   *
   * Defaults to (ts) => new Date(ts).toISOString()
   *
   * @param {Function} callback Callback function to use instead of default.
   */
  set timeFormat (callback) {
    this.#timeFormat = callback;
  }

  /**
   * Change the default 'informal' text (pretext in slack docs) to another value.
   * Default value is: 'A log message with the tag %s, was logged at %s.'.
   * Parameters used are the following: 1: %s - tag, 2: %s - timestamp formatted with timeFormat callback.
   *
   * @param {String} value Value to set.
   */
  set informalText (value) {
    this.#informalText = value;
  }

  /**
   * Constructor for the Slack Yolog plugin.
   *
   * @param {String} webHookUri URI to send webhook payload to.
   * @param {String|null} [channel] Optional channel or user -name, if not set, default channel is used.
   */
  constructor (webHookUri, channel = null) {
    super();
    this.#webHookUri = webHookUri;
    this.#channel = channel;
  }

  /**
   * Method called when a log message is intercepted and the plugin is listening to the given tag.
   *
   * @param {String} tag Tag which was used when logging the message.
   * @param {Number} timestamp Timestamp (in ms) when the log was intercepted by the Yolog instance.
   * @param {String} message
   * @return Promise<void>
   * @abstract
   */
  async log (tag, timestamp, message) {
    let color = '#CCCC00';
    if (tag in this.#colors) {
      color = this.#colors[tag];
    }

    const payload = {
      channel: this.#channel,
      attachments: [{
        pretext: sprintf(this.#informalText, tag, this.#timeFormat(timestamp)),
        fallback: `[${tag.toUpperCase()}] (${this.#timeFormat(timestamp)}): ${message}`,
        color: color,
        fields: [{
          title: tag.toUpperCase(),
          value: message,
          short: false
        }]
      }],
      username: 'Yolog'
    };
    await fetch(this.#webHookUri, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}
