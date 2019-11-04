import Slack from '../src';
import fetch from 'node-fetch';

jest.mock('node-fetch');

describe('Test slack plugin.', () => {
  let plugin = null;

  beforeEach(() => {
    plugin = new Slack('https://fake-webhook.com');
  });

  afterEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  test('Sends message to defined URI.', async () => {
    fetch.mockResolvedValue(() => Promise.resolve());
    await expect(plugin.log('test', 12345678, 'Message message!')).resolves.toBeUndefined();

    expect(fetch.mock.calls[0][0]).toEqual('https://fake-webhook.com');
    const resultJson = JSON.parse(fetch.mock.calls[0][1].body);
    expect(resultJson).toEqual(
      {
        blocks: [
          {
            text: {
              text: '_*TEST!*_\n_<!date^12346^{date_num} {time_secs}|1970-01-01T03:25:45.678Z>_',
              type: 'mrkdwn'
            },
            type: 'section'
          },
          {
            type: 'divider'
          },
          {
            text: {
              text: 'Message message!',
              type: 'plain_text'
            },
            type: 'section'
          }
        ],
        channel: null,
        text: "A log message with the tag 'test' was logged!",
        username: 'Yolog'
      });
  });

  test('Sends message with changed time-format.', async () => {
    fetch.mockResolvedValue(() => Promise.resolve());
    plugin.timeFormat = (t) => t;
    await expect(plugin.log('error', 12345678, 'Message message!', new Error())).resolves.toBeUndefined();

    expect(fetch.mock.calls[0][0]).toEqual('https://fake-webhook.com');
    const resultJson = JSON.parse(fetch.mock.calls[0][1].body);
    expect(resultJson).toEqual({
      blocks: [
        {
          text: {
            text: '_*ERROR!*_\n_<!date^12346^{date_num} {time_secs}|12345678>_',
            type: 'mrkdwn'
          },
          type: 'section'
        },
        {
          type: 'divider'
        },
        {
          text: {
            text: 'Message message!',
            type: 'plain_text'
          },
          type: 'section'
        },
        {
          elements: [
            {
              text: '_*CallStack:*_',
              type: 'mrkdwn'
            },
            {
              text: expect.any(String),
              type: 'mrkdwn'
            }
          ],
          type: 'context'
        }
      ],
      channel: null,
      text: "A log message with the tag 'error' was logged!",
      username: 'Yolog'
    });
  });

  test('Sends message with changed notification text.', async () => {
    fetch.mockResolvedValue(() => Promise.resolve());
    plugin.notificationText = 'Test test';
    await expect(plugin.log('test', 12345678, 'Message message!')).resolves.toBeUndefined();

    expect(fetch.mock.calls[0][0]).toEqual('https://fake-webhook.com');
    const resultJson = JSON.parse(fetch.mock.calls[0][1].body);
    expect(resultJson).toEqual({
      blocks: [
        {
          text: {
            text: '_*TEST!*_\n_<!date^12346^{date_num} {time_secs}|1970-01-01T03:25:45.678Z>_',
            type: 'mrkdwn'
          },
          type: 'section'
        },
        {
          type: 'divider'
        },
        {
          text: {
            text: 'Message message!',
            type: 'plain_text'
          },
          type: 'section'
        }
      ],
      channel: null,
      text: 'Test test',
      username: 'Yolog'
    });
  });

  test('Throws error on fetch error.', async () => {
    fetch.mockImplementation(async () => throw Error('Tis was an errors!'));
    return expect(plugin.log('test', 12345678, 'Message message!')).rejects.toThrow('Tis was an errors!');
  });
});
